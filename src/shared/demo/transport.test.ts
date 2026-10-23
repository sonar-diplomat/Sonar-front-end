import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import test from 'node:test';

import ts from 'typescript';

import rawSeed from '../../../demo/data/seed.json' with { type: 'json' };
import { normalizeSubscriptionPack } from '../../entities/Subscription/api/normalizeSubscription.ts';
import { normalizeQueue } from '../../entities/UserState/api/normalizeQueue.ts';

import { clone, STORAGE_KEY, validateSeed, type DemoSeed, type MockRequest, type LocalEvent } from './database.ts';
import type { DemoStorage } from './persistence.ts';
import { createMockTransport, mockRouteInventory } from './transport.ts';

class MemoryStorage implements DemoStorage {
  data = new Map<string, string>();
  getItem(key: string) { return this.data.get(key) ?? null; }
  setItem(key: string, value: string) { this.data.set(key, value); }
  removeItem(key: string) { this.data.delete(key); }
}
const seed = rawSeed as DemoSeed;
function make(options: Partial<Parameters<typeof createMockTransport>[0]> = {}) { return createMockTransport({ seed, storage: new MemoryStorage(), now: () => '2026-02-01T00:00:00.000Z', baseUrl: '/Sonar-front-end/', origin: 'https://demo.example.test', ...options }); }
async function success<T>(transport: ReturnType<typeof make>, request: MockRequest): Promise<T> { const result = await transport.dispatch(request); assert.equal(result.success, true, `${request.method ?? 'GET'} ${request.url}: ${result.message} ${result.details}`); return result.data as T; }

test('seed IDs and all normalized relationships are valid and isolated from visitor changes', () => {
  validateSeed(seed); assert.equal(seed.state.artists.length, 4); assert.equal(seed.state.tracks.length, 12); assert.equal(seed.state.albums.length, 3); assert.equal(seed.state.playlists.length, 4); assert.equal(seed.state.folders.length, 2);
  const t = make(), snapshot = t.getSnapshot(); snapshot.tracks[0].title = 'Changed outside transport'; assert.equal(t.getSnapshot().tracks[0].title, 'Carefree'); assert.equal(seed.state.tracks[0].title, 'Carefree');
  const broken = clone(seed); broken.state.tracks[0].artistIds = [999]; assert.throws(() => make({ seed: broken }), /relation/);
});
test('search is case insensitive, matches related artists, paginates without changing total and sorts', async () => {
  const t = make(); const first = await success<{ total: number; items: { id: number; title: string }[] }>(t, { url: 'Search/tracks?query=aurora&limit=2' });
  const next = await success<typeof first>(t, { url: '/api/Search/tracks', params: { query: 'AURORA', limit: 2, offset: 2 } });
  assert.equal(first.total, 4); assert.equal(next.total, 4); assert.deepEqual([...first.items, ...next.items].map(v => v.id), [1, 2, 3, 4]);
  const all = await success<{ tracks: typeof first; albums: typeof first }>(t, { url: 'Search', params: { query: 'Aurora Field' } }); assert.equal(all.tracks.total, 4); assert.equal(all.albums.total, 1);
  const sorted = await success<typeof first>(t, { url: 'Search/tracks', params: { query: '', limit: 100, sort: 'title', order: 'desc' } }); assert.equal(sorted.items[0].title, 'Wallpaper');
  assert.deepEqual(await success(t, { url: 'Search/tracks?query=no-such-song' }), { total: 0, items: [] });
  assert.equal((await t.dispatch({ url: 'Search/tracks?offset=-1' })).status, 400); assert.equal((await t.dispatch({ url: 'Search?category=invalid' })).status, 400);
});
test('playlist cursor pages, errors and library projections remain consistent across mutations and reload', async () => {
  const storage = new MemoryStorage(), t = make({ storage });
  const first = await success<{ items: { id: number }[]; nextCursor: string }>(t, { url: 'Playlist/202/tracks?limit=2' });
  const next = await success<{ items: { id: number }[]; hasMore: boolean }>(t, { url: 'Playlist/202/tracks', params: { limit: 2, after: first.nextCursor } }); assert.deepEqual([...first.items, ...next.items].map(v => v.id), [2, 4, 7, 10]); assert.equal(next.hasMore, false);
  assert.equal((await t.dispatch({ url: 'Playlist/202/tracks?after=unknown' })).status, 400);
  const created = await success<{ id: number }>(t, { url: 'Playlist/create', method: 'POST', body: { name: 'Visitor mix' } });
  await success(t, { url: `Playlist/${created.id}/add-track/3`, method: 'POST' }); await success(t, { url: `Playlist/${created.id}/add-track/3`, method: 'POST' });
  await success(t, { url: `Playlist/${created.id}/update-name`, method: 'PUT', params: { newName: 'Reload mix' } });
  const reloaded = make({ storage }); assert.deepEqual((await success<{ items: { id: number }[] }>(reloaded, { url: `Playlist/${created.id}/tracks` })).items.map(v => v.id), [3]);
  const folders = await success<{ collections: { name: string }[] }[]>(reloaded, { url: 'Folder' }); assert(folders.flatMap(f => f.collections).some(c => c.name === 'Reload mix'));
  await success(reloaded, { url: `Playlist/${created.id}`, method: 'DELETE' }); assert.equal((await reloaded.dispatch({ url: `Playlist/${created.id}` })).status, 404);
  assert.equal((await reloaded.dispatch({ url: 'Playlist/201', method: 'DELETE' })).status, 403);
});
test('favorites have one source and follow/settings changes persist', async () => {
  const storage = new MemoryStorage(), t = make({ storage }); await success(t, { url: 'Track/2/toggle-favorite', method: 'POST' });
  assert.equal((await success<{ isFavorite: boolean }>(t, { url: 'Track/2' })).isFavorite, true);
  assert((await success<{ items: { id: number }[] }>(t, { url: 'Playlist/201/tracks' })).items.some(v => v.id === 2));
  await success(t, { url: 'UserFollow/3/follow', method: 'POST' }); await success(t, { url: 'UserFollow/3/follow', method: 'POST' });
  assert.equal((await success<unknown[]>(t, { url: 'UserFollow/1/following' })).length, 2);
  await success(t, { url: 'ClientSettings', method: 'PATCH', body: { autoPlay: true, themeId: 2, blockedUserIds: [5], userPrivacy: { whichCanMessageId: 3 } } });
  const reloaded = make({ storage }); const settings = await success<{ autoPlay: boolean; theme: { id: number }; blockedUserIds: number[]; userPrivacy: { whichCanMessage: { id: number } } }>(reloaded, { url: 'ClientSettings' }); assert.equal(settings.autoPlay, true); assert.equal(settings.theme.id, 2); assert.deepEqual(settings.blockedUserIds, [5]); assert.equal(settings.userPrivacy.whichCanMessage.id, 3);
  assert.equal((await t.dispatch({ url: 'ClientSettings', method: 'PATCH', body: { unknown: true } })).status, 400);
});
test('folder cycles and ownership errors roll back complete transactions', async () => {
  const t = make(); const child = await success<{ id: number }>(t, { url: 'Folder', method: 'POST', body: { name: 'Child', parentFolderId: 2 } }); const before = t.getSnapshot();
  assert.equal((await t.dispatch({ url: `Folder/2/move/${child.id}`, method: 'PUT' })).status, 400); assert.deepEqual(t.getSnapshot(), before);
  assert.equal((await t.dispatch({ url: 'Playlist/204', method: 'DELETE' })).status, 403);
  await success(t, { url: 'Folder/move-collection/202/to-folder/2', method: 'PUT' }); assert(t.getSnapshot().folders.find(f => f.id === 2)?.collectionIds.includes(202)); assert(!t.getSnapshot().folders.find(f => f.id === 1)?.collectionIds.includes(202));
});
test('local chat events use existing payloads; read is idempotent and edits/deletes persist', async () => {
  const events: LocalEvent[] = [], storage = new MemoryStorage(), t = make({ storage, onEvent: e => events.push(e) });
  const m = await success<{ id: number; chatId: number }>(t, { url: 'Chat/1/send', method: 'POST', body: { textContent: 'Local message', replyMessageId: 1 } });
  const created = events.find(e => e.name === 'message.created')?.payload as { id: number; createdAtUtc: string }; assert.equal(created.id, m.id); assert.equal(created.createdAtUtc, '2026-02-01T00:00:00.000Z');
  await success(t, { url: 'Chat/1/read', method: 'PUT', body: [1] }); await success(t, { url: 'Chat/1/read', method: 'PUT', body: [1] }); assert.equal(events.filter(e => e.name === 'message.read').length, 1);
  await success(t, { url: `Chat/message/${m.id}`, method: 'PUT', body: { textContent: 'Edited' } }); assert.equal((await success<{ textContent: string }>(make({ storage }), { url: `Chat/message/${m.id}` })).textContent, 'Edited');
  await success(t, { url: `Chat/message/${m.id}`, method: 'DELETE' }); assert.equal((await t.dispatch({ url: `Chat/message/${m.id}` })).status, 404);
  assert.equal((await t.dispatch({ url: 'Chat/2/read', method: 'PUT', body: [1] })).status, 404);
});
test('registration, confirmation, recovery and subscription produce local receipts without raw passwords', async () => {
  const storage = new MemoryStorage(), t = make({ storage }); const password = 'visitor-password';
  await success(t, { url: 'Auth/register', method: 'POST', body: { Username: 'Visitor', Login: 'visitor', Email: 'visitor@example.test', Password: password, FirstName: 'Visitor', LastName: 'Local' } });
  await success(t, { url: 'Auth/confirm-email', method: 'POST', params: { email: 'visitor@example.test', token: 'demo-token' } });
  assert.equal((await t.dispatch({ url: 'Auth/confirm-email', method: 'POST', params: { email: 'visitor@example.test', token: 'demo-token' } })).status, 400);
  await success(t, { url: 'Demo/session', method: 'DELETE' });
  const login = await success<{ accessToken: string; demoUserId: number }>(t, { url: 'Auth/login', method: 'POST', params: { userIdentifier: 'visitor', password } }); assert.equal(login.accessToken, ''); assert(login.demoUserId >= 10000);
  await success(t, { url: 'Auth/forgot-password', method: 'POST', body: { Email: 'visitor@example.test' } });
  await success(t, { url: 'Auth/reset-password', method: 'POST', body: { Email: 'visitor@example.test', Token: 'demo-token', NewPassword: 'changed-password' } });
  const payment = await success<{ id: number; amount: number }>(t, { url: 'Subscription/purchase', method: 'POST', body: { subscriptionPackId: 1, amount: 2 } }); assert.equal(payment.amount, 2); assert.equal(t.getSnapshot().payments.length, 1);
  assert(!storage.getItem(STORAGE_KEY)?.includes(password)); assert(!storage.getItem(STORAGE_KEY)?.includes('changed-password'));
  await success(t, { url: 'Auth/sessions/revoke-all', method: 'POST' }); assert.equal((await make({ storage }).dispatch({ url: 'ClientSettings' })).status, 401);
});
test('uploads stay binary and transaction IDs remain unique under concurrent mutations', async () => {
  const uploads = new Map<number, Blob>(), t = make({ storeBlob: async (id, blob) => { uploads.set(id, blob); } });
  const form = new FormData(); form.set('file', new Blob(['svg contents'], { type: 'image/svg+xml' }), 'cover.svg'); await success(t, { url: 'User/update-avatar', method: 'POST', body: form }); const mediaId = t.getSnapshot().users[0].avatarImageId; assert(mediaId >= 10000); assert.equal(uploads.get(mediaId)?.type, 'image/svg+xml');
  const created = await Promise.all(Array.from({ length: 8 }, (_, i) => success<{ id: number }>(t, { url: 'Playlist/create', method: 'POST', body: { name: `Concurrent ${i}` } }))); assert.equal(new Set(created.map(v => v.id)).size, 8); assert.equal(t.getSnapshot().playlists.length, 12);
});
test('reset and incompatible/corrupt versions preserve unrelated storage and restore deterministic seed', async () => {
  const storage = new MemoryStorage(); storage.setItem('sonar_refresh_token', 'original-api-credential'); storage.setItem('unrelated', 'keep'); const t = make({ storage }); await success(t, { url: 'Playlist/create', method: 'POST', body: { name: 'Transient' } }); await t.reset(); assert.deepEqual(t.getSnapshot(), seed.state); assert.equal(storage.getItem('unrelated'), 'keep'); assert.equal(storage.getItem('sonar_refresh_token'), 'original-api-credential');
  storage.setItem(STORAGE_KEY, JSON.stringify({ schemaVersion: 999, state: {} })); const migrated = make({ storage }); assert.equal(migrated.getStatus().reset, true); assert.deepEqual(migrated.getSnapshot(), seed.state);
  storage.setItem(STORAGE_KEY, '{broken'); assert.deepEqual(make({ storage }).getSnapshot(), seed.state);
});
test('storage failure remains usable and reports memory-only persistence', async () => { const storage: DemoStorage = { getItem: () => null, setItem: () => { throw new Error('Quota'); }, removeItem: () => {} }; const t = make({ storage }); await success(t, { url: 'Track/2/toggle-favorite', method: 'POST' }); assert.equal(t.getStatus().persistent, false); assert.match(t.getStatus().reason ?? '', /tab only/); });
test('unknown routes and abort/error/empty scenarios cannot fall back to any network', async () => {
  const original = globalThis.fetch; let fetches = 0; globalThis.fetch = () => { fetches++; throw new Error('Unexpected network'); };
  try { const t = make(); const missing = await t.dispatch({ url: 'https://old-server.invalid/api/Unknown/1' }); assert.equal(missing.status, 404); assert.match(missing.message, /GET Unknown\/1/); assert.equal(missing.details?.[0], 'MOCK_ENDPOINT_NOT_FOUND');
    const aborted = new AbortController(); aborted.abort(); assert.equal((await t.dispatch({ url: 'Track/1', signal: aborted.signal })).status, 499);
    assert.equal((await make({ scenario: 'error' }).dispatch({ url: 'Search/tracks' })).status, 503);
    assert.deepEqual(await success(make({ scenario: 'empty' }), { url: 'Search/tracks' }), { total: 0, items: [] }); assert.equal(fetches, 0);
  } finally { globalThis.fetch = original; }
});
test('all configured read routes are recognized and query declarations carry DemoState across lazy injection', async () => {
  const seen = new Set<string>(); for (const { method, path } of mockRouteInventory) { assert(!seen.has(`${method} ${path}`), `Duplicate route ${method} ${path}`); seen.add(`${method} ${path}`); }
  for (const { method, path } of mockRouteInventory.filter(r => r.method === 'GET' && !r.path.endsWith('qr') && !r.path.includes('update-key'))) {
    const sample = path.replace('Album/:id', 'Album/101').replace('Playlist/:id', 'Playlist/201').replace('Report/reason-types/by-entity-type/:id', 'Report/reason-types/by-entity-type/1').replace(':identifier', 'demo').replace(/:\w+/g, '1'); const result = await make().dispatch({ url: sample }); assert.notEqual(result.details?.[0], 'MOCK_ENDPOINT_NOT_FOUND', `${method} ${sample}`);
  }
  const base = await readFile(new URL('../api/rtkBaseQuery.ts', import.meta.url), 'utf8'); assert(base.indexOf('if (isDemoMode)') < base.indexOf('requestFetch(fullUrl'));
  const legacy = await readFile(new URL('../api/oldBaseApi.ts', import.meta.url), 'utf8'); assert(legacy.indexOf('if (isDemoMode)') < legacy.indexOf('requestFetch(url'));
});

test('every configured endpoint path has a local operation or explicit media resolver', async () => {
  const source = await readFile(new URL('../config/api.config.ts', import.meta.url), 'utf8');
  const js = ts.transpileModule(source.replaceAll('import.meta.env', '({})'), { compilerOptions: { module: ts.ModuleKind.ESNext } }).outputText;
  const imported: unknown = await import(`data:text/javascript;base64,${Buffer.from(js).toString('base64')}`);
  const endpoints = (imported as { API_ENDPOINTS: Record<string, Record<string, string | ((...args: (string | number)[]) => string)>> }).API_ENDPOINTS;
  for (const [group, entries] of Object.entries(endpoints)) for (const [name, endpoint] of Object.entries(entries)) {
    const args: (number | string)[] = group === 'share' ? ['Track', 1] : group === 'collection' ? ['Playlist', 201] : name === 'importCollection' ? [202, 'album', 101] : name === 'profileByIdentifier' ? ['demo'] : Array(typeof endpoint === 'function' ? endpoint.length : 0).fill(1);
    const path = typeof endpoint === 'string' ? endpoint : endpoint(...args);
    const registered = mockRouteInventory.some(r => new RegExp(`^${r.path.replace(/:\w+/g, '[^/]+')}$`, 'i').test(path));
    assert(registered || /^blob\/\d+$|^Track\/\d+\/stream$/i.test(path), `${group}.${name}: ${path}`);
  }
});
test('all RTK query definitions carry DemoState without relying on bootstrap injection order', async () => {
  const directory = new URL('../../entities/', import.meta.url);
  const paths = (await readdir(directory, { withFileTypes: true })).filter(e => e.isDirectory()).map(e => new URL(`${e.name}/api/rtkApi.ts`, directory));
  paths.push(new URL('../../features/auth/api/rtkApi.ts', import.meta.url));
  let queries = 0;
  for (const path of paths) {
    let source: string; try { source = await readFile(path, 'utf8'); } catch { continue; }
    const file = ts.createSourceFile(path.pathname, source, ts.ScriptTarget.Latest, true);
    const visit = (node: ts.Node) => {
      if (ts.isCallExpression(node) && ts.isPropertyAccessExpression(node.expression) && node.expression.name.text === 'query' && node.arguments[0] && ts.isObjectLiteralExpression(node.arguments[0])) {
        queries++; const tag = node.arguments[0].properties.find(p => p.name?.getText(file) === 'providesTags'); assert(tag?.getText(file).includes('DemoState'), `Missing tag in ${path.pathname}: ${node.getText(file).slice(0, 90)}`);
      }
      ts.forEachChild(node, visit);
    };
    visit(file);
  }
  assert(queries > 50);
});
test('reads and idempotent writes do not emit state-change loops; listening changes recency once', async () => {
  const events: LocalEvent[] = [], t = make({ onEvent: event => events.push(event) });
  await success(t, { url: 'Folder' }); await success(t, { url: 'UserState/queue' }); assert.equal(events.length, 0);
  await success(t, { url: 'UserState/listening/1/101', method: 'PUT' }); const snapshot = t.getSnapshot();
  await success(t, { url: 'UserState/listening/1/101', method: 'PUT' }); assert.deepEqual(t.getSnapshot(), snapshot);
  await success(t, { url: 'UserFollow/2/follow', method: 'POST' }); assert.deepEqual(t.getSnapshot(), snapshot);
  assert.equal(events.filter(e => e.name === 'state.changed').length, 1);
});
test('posts, artist names and release deletion remain coherent across projections', async () => {
  const t = make(); const post = await success<{ id: number }>(t, { url: 'Artist', method: 'POST', body: { title: 'Visitor post', textContent: 'Hello' } });
  await success(t, { url: `Artist/post/${post.id}`, method: 'PUT', body: { title: 'Edited post', textContent: 'Updated' } });
  assert((await success<{ title: string }[]>(t, { url: 'Artist/1/posts' })).some(p => p.title === 'Edited post'));
  await success(t, { url: 'Artist/1/update-name', method: 'PUT', body: 'Renamed artist' });
  assert.equal((await success<{ albumArtists: { pseudonym: string }[] }>(t, { url: 'Album/101' })).albumArtists[0].pseudonym, 'Renamed artist');
  await success(t, { url: 'UserState/queue', method: 'PUT', body: [1, 5] }); await success(t, { url: 'Album/101', method: 'DELETE' });
  assert.equal(t.getSnapshot().tracks.length, 8); assert.deepEqual(t.getSnapshot().queues[1].trackIds, [5]); assert(!t.getSnapshot().playlists.some(p => p.trackIds.includes(1))); validateSeed({ ...seed, state: t.getSnapshot() });
});
test('local moderation/distributor/payment actions are inspectable and persist without server calls', async () => {
  const storage = new MemoryStorage(), t = make({ storage });
  const report = await success<{ id: number }>(t, { url: 'Report', method: 'POST', body: { entityIdentifier: 1, reportableEntityTypeId: 1, reportReasonTypeId: 1 } });
  await success(t, { url: `Report/${report.id}/close`, method: 'PUT' }); assert.equal((await success<unknown[]>(t, { url: 'Report/filter', params: { filter: JSON.stringify({ isClosed: true, entityId: 1 }) } })).length, 1);
  await success(t, { url: 'DistributorMaster/account/1/password', method: 'PUT', body: { oldPassword: 'demo-password', newPassword: 'new-local-password' } });
  const login = await success<{ accessToken: string }>(t, { url: 'AuthDistributor/login', method: 'POST', params: { email: 'distributor@example.test', password: 'new-local-password' } }); assert.equal(login.accessToken, '');
  await success(t, { url: 'Distributor/request/1', method: 'POST', params: { approve: true } }); assert(make({ storage }).getSnapshot().artists.some(a => a.userId === 5));
  const share = await success<string>(t, { url: 'Track/1/link' }); assert.equal(share, 'https://demo.example.test/Sonar-front-end/#/track/1');
});
test('upload failures roll back and reset waits behind in-flight binary writes', async () => {
  const failed = make({ storeBlob: async () => { throw new Error('Quota exceeded'); } }), form = new FormData(); form.set('File', new Blob(['image'], { type: 'image/png' }), 'cover.png');
  const before = failed.getSnapshot(); assert.equal((await failed.dispatch({ url: 'User/update-avatar', method: 'POST', body: form })).status, 507); assert.deepEqual(failed.getSnapshot(), before);
  let release!: () => void; const blocked = new Promise<void>(resolve => { release = resolve; }); const order: string[] = [];
  const t = make({ storeBlob: async () => { order.push('write'); await blocked; order.push('saved'); } });
  const pendingUpload = t.dispatch({ url: 'User/update-avatar', method: 'POST', body: form }); const reset = t.reset(async () => { order.push('clear'); }); release(); await pendingUpload; await reset; assert.deepEqual(order, ['write', 'saved', 'clear']); assert.deepEqual(t.getSnapshot(), seed.state);
});
test('legacy queue normalization handles Pascal/camel DTOs without losing IDs, zero position or empty queue', () => {
  const track = seed.state.tracks[0];
  const queue = normalizeQueue({ id: 1, position: '00:00:00', collectionId: 101, currentTrackId: 1, queueTracks: [{ id: 10, trackId: 1, order: 0, track }] });
  assert.equal(queue?.QueueTracks[0].Track.id, 1); assert.equal(queue?.QueueTracks[0].Order, 0); assert.equal(queue?.CurrentTrackId, 1);
  assert.deepEqual(normalizeQueue({ Id: 1, QueueTracks: [] })?.QueueTracks, []); assert.equal(normalizeQueue('invalid JSON'), null);
});

test('two tabs sharing storage keep a playlist when the other tab saves playback progress', async () => {
  const storage = new MemoryStorage(), tabA = make({ storage }), tabB = make({ storage });
  const playlist = await success<{ id: number }>(tabA, { url: 'Playlist/create', method: 'POST', body: { name: 'Across tabs' } });
  await success(tabB, { url: 'UserState/current-position', method: 'PUT', body: '00:00:15' });
  await success(tabA, { url: 'Track/2/toggle-favorite', method: 'POST' });
  await success(tabB, { url: 'UserState/current-position', method: 'PUT', body: '00:00:20' });
  const reloaded = make({ storage }); assert(reloaded.getSnapshot().playlists.some(p => p.id === playlist.id)); assert.equal(reloaded.getSnapshot().queues[1].position, '00:00:20'); assert(reloaded.getSnapshot().playlists.find(p => p.id === 201)?.trackIds.includes(2));
});
test('injected cross-tab locks serialize awaited uploads and mutations without duplicate IDs', async () => {
  let pending: Promise<unknown> = Promise.resolve();
  const runExclusive = <T>(action: () => Promise<T>): Promise<T> => { const next = pending.then(action, action); pending = next.catch(() => undefined); return next; };
  const storage = new MemoryStorage(); let release!: () => void; const barrier = new Promise<void>(resolve => { release = resolve; });
  const a = make({ storage, runExclusive, storeBlob: async () => { await barrier; } }), b = make({ storage, runExclusive });
  const form = new FormData(); form.set('file', new Blob(['image'], { type: 'image/png' }), 'image.png');
  const upload = a.dispatch({ url: 'User/update-avatar', method: 'POST', body: form });
  const create = success<{ id: number }>(b, { url: 'Playlist/create', method: 'POST', body: { name: 'Concurrent tab playlist' } });
  release(); await upload; const playlist = await create; const state = make({ storage }).getSnapshot(); assert.notEqual(state.users[0].avatarImageId, playlist.id); assert(state.playlists.some(p => p.id === playlist.id));
  const external: LocalEvent[] = []; const observer = make({ storage, onEvent: e => external.push(e) }); await b.reset(); await observer.synchronize(); assert.deepEqual(observer.getSnapshot(), seed.state); assert.equal((external.find(e => e.name === 'state.external')?.payload as { reset: boolean }).reset, true);
});
test('without Web Locks simultaneous stale commits return a conflict instead of silently losing changes', async () => {
  const storage = new MemoryStorage(), a = make({ storage }), b = make({ storage });
  const [first, second] = await Promise.all([a.dispatch({ url: 'Playlist/create', method: 'POST', body: { name: 'Concurrent A' } }), b.dispatch({ url: 'Playlist/create', method: 'POST', body: { name: 'Concurrent B' } })]);
  assert.equal(first.success, true); assert.equal(second.status, 409); assert.equal(second.details?.[0], 'MOCK_CONFLICT_RETRY');
  await success(b, { url: 'Playlist/create', method: 'POST', body: { name: 'Concurrent B' } });
  const state = make({ storage }).getSnapshot(); assert(state.playlists.some(p => p.name === 'Concurrent A')); assert(state.playlists.some(p => p.name === 'Concurrent B'));
});
test('gift send creates the sender receipt, recipient accept reuses it and cancel removes it', async () => {
  const t = make(); const gift = await success<{ id: number; paymentId: number }>(t, { url: 'Gift/send', method: 'POST', body: { title: 'Local gift', textContent: 'Enjoy', giftStyleId: 1, receiverId: 5, buyerId: 1, subscriptionPackId: 1, amount: 5.5 } });
  assert.equal(t.getSnapshot().payments.length, 1); assert.equal(t.getSnapshot().users[0].subscriptionPackId, undefined);
  await success(t, { url: 'Auth/login', method: 'POST', params: { userIdentifier: 'listener5@example.test', password: 'demo-password' } });
  const receipt = await success<{ id: number; buyerId: number; amount: number }>(t, { url: `Gift/${gift.id}/accept`, method: 'POST' }); assert.equal(receipt.id, gift.paymentId); assert.equal(receipt.buyerId, 1); assert.equal(receipt.amount, 5.5); assert.equal(t.getSnapshot().payments.length, 1);
  await success(t, { url: 'Demo/session', method: 'POST' });
  const cancelled = await success<{ id: number; paymentId: number }>(t, { url: 'Gift/send', method: 'POST', body: { title: 'Cancel me', giftStyleId: 1, receiverId: 2, buyerId: 1, subscriptionPackId: 1, amount: 5 } });
  assert.equal((await t.dispatch({ url: `Gift/${cancelled.id}/cancel`, method: 'DELETE' })).status, 403);
  await success(t, { url: 'Auth/login', method: 'POST', params: { userIdentifier: 'listener2@example.test', password: 'demo-password' } }); await success(t, { url: `Gift/${cancelled.id}/cancel`, method: 'DELETE' }); assert(!t.getSnapshot().payments.some(p => p.id === cancelled.paymentId));
});
test('SignalR package loads only inside API connection construction, and User sharing uses the identifier', async () => {
  for (const name of ['signalr-manager.ts', 'useSignalR.ts']) { const source = await readFile(new URL(`../lib/signalr/${name}`, import.meta.url), 'utf8'); const file = ts.createSourceFile(name, source, ts.ScriptTarget.Latest, true); for (const statement of file.statements) if (ts.isImportDeclaration(statement) && statement.moduleSpecifier.getText(file).includes('@microsoft/signalr')) assert(statement.importClause?.isTypeOnly, 'SignalR must not be a value import on startup'); }
  assert.equal(await success(make(), { url: 'User/1/link' }), 'https://demo.example.test/Sonar-front-end/#/user/demo');
});
test('subscription DTO normalizes current server features and legacy subscriptionFeatures consistently', () => {
  const expected = normalizeSubscriptionPack(seed.state.packs[0]);
  const raw = { ...seed.state.packs[0], subscriptionFeatures: undefined, features: seed.state.packs[0].subscriptionFeatures };
  assert.deepEqual(normalizeSubscriptionPack(raw), expected);
  assert.throws(() => normalizeSubscriptionPack({ id: 'bad' }), /Invalid/);
});
test('cancelled binary mutation removes its new upload and allows a clean retry with the same sequence', async () => {
  const uploads = new Map<number, Blob>(), controller = new AbortController(); let cancel = true;
  const t = make({ storeBlob: async (id, blob) => { uploads.set(id, blob); if (cancel) controller.abort(); }, deleteBlob: async id => { uploads.delete(id); } });
  const form = new FormData(); form.set('file', new Blob(['image'], { type: 'image/png' }), 'image.png');
  assert.equal((await t.dispatch({ url: 'User/update-avatar', method: 'POST', body: form, signal: controller.signal })).status, 499); assert.equal(uploads.size, 0); assert.equal(t.getSnapshot().nextId, 10000);
  cancel = false; await success(t, { url: 'User/update-avatar', method: 'POST', body: form }); assert.equal(uploads.size, 1); assert.equal(t.getSnapshot().users[0].avatarImageId, 10000);
});

test('report form rejects Track plus Spam atomically and accepts an applicable reason for a registered visitor', async () => {
  const storage = new MemoryStorage(), t = make({ storage });
  await success(t, { url: 'Auth/register', method: 'POST', body: { Username: 'Report Visitor', Login: 'report-visitor', Email: 'report-visitor@example.test', Password: 'report-password', FirstName: 'Report', LastName: 'Visitor' } });
  await success(t, { url: 'Auth/confirm-email', method: 'POST', params: { email: 'report-visitor@example.test', token: 'demo-token' } });
  const login = await success<{ demoUserId: number }>(t, { url: 'Auth/login', method: 'POST', params: { userIdentifier: 'report-visitor', password: 'report-password' } });
  const applicable = await success<{ id: number; applicableEntityTypeIds: number[] }[]>(t, { url: 'Report/reason-types/by-entity-type/1' });
  assert(applicable.every(reason => reason.applicableEntityTypeIds.includes(1))); assert(!applicable.some(reason => reason.id === 2));
  const before = t.getSnapshot();
  const invalid = await t.dispatch({ url: 'Report', method: 'POST', body: { entityIdentifier: 1, reportableEntityTypeId: 1, reportReasonTypeId: 2 } });
  assert.equal(invalid.status, 400); assert.equal(invalid.message, 'Reason does not apply to this entity'); assert.deepEqual(t.getSnapshot(), before);
  const saved = await success<{ id: number; reporterId: number }>(t, { url: 'Report', method: 'POST', body: { entityIdentifier: 1, reportableEntityTypeId: 1, reportReasonTypeId: applicable[0].id } });
  assert.equal(saved.reporterId, login.demoUserId); assert.deepEqual(await success(make({ storage }), { url: `Report/${saved.id}` }), saved);
});
