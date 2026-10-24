import { clone,type DemoFolder,type DemoPlaylist,type DemoState,type DemoTrack,type LocalEvent } from './database.ts';

export class MockError extends Error { readonly status: number; readonly code: string; constructor(status: number, message: string, code = 'MOCK_VALIDATION') { super(message); this.status = status; this.code = code; } }
export const need = (condition: unknown, message: string, status = 400): void => { if (!condition) throw new MockError(status, message); };
export function byId<T extends { id: number }>(rows: T[], id: number, label = 'Record'): T { const row = rows.find(v => v.id === id); if (!row) throw new MockError(404, `${label} ${id} was not found`, 'MOCK_NOT_FOUND'); return row; }
export function integer(value: unknown, label = 'ID'): number { const n = Number(value); need(Number.isSafeInteger(n) && n > 0, `${label} must be a positive integer`); return n; }
export function text(value: unknown, label = 'Name', max = 200): string { need(typeof value === 'string' && value.trim().length > 0 && value.trim().length <= max, `${label} must contain 1..${max} characters`); return (value as string).trim(); }
export function record(value: unknown): Record<string, unknown> { need(value !== null && typeof value === 'object' && !Array.isArray(value), 'Expected an object body'); return value as Record<string, unknown>; }
export function numbers(value: unknown): number[] { need(Array.isArray(value), 'Expected a list of IDs'); return [...new Set((value as unknown[]).map(v => integer(v)))]; }
export const removeId = <T extends { id: number }>(rows: T[], id: number): T[] => rows.filter(r => r.id !== id);
export const toggle = (ids: number[], id: number): number[] => ids.includes(id) ? ids.filter(v => v !== id) : [...ids, id];
export const durationSeconds = (value: string | null): number => (value ?? '0').split(':').reduce((total, n) => total * 60 + Number(n), 0);
export const features = ['SendMessage', 'ReportContent', 'ListenContent', 'UserLogin', 'CreatePost'].map((name, i) => ({ id: i + 1, name }));
export const languages = [{ id: 1, locale: 'en', name: 'English', nativeName: 'English' }, { id: 2, locale: 'uk', name: 'Ukrainian', nativeName: 'Українська' }];
export const themes = [{ id: 1, name: 'Dark', description: 'Dark appearance' }, { id: 2, name: 'Light', description: 'Light appearance' }];
export const qualities = [{ id: 1, name: 'Low', bitRate: 64 }, { id: 2, name: 'Standard', bitRate: 128 }, { id: 3, name: 'High', bitRate: 320 }];
export const privacyGroups = [{ id: 1, name: 'Everyone' }, { id: 2, name: 'Friends' }, { id: 3, name: 'Only Me' }];
export interface OperationOptions {
  baseUrl?: string;
  origin?: string;
  now?: () => string;
  storeBlob?: (id: number, file: Blob) => Promise<void>;
  deleteBlob?: (id: number) => Promise<void>;
  qr?: (url: string) => Promise<string>;
  imageUrl?: (id: number) => string | undefined;
}
export interface Context {
  s: DemoState;
  p: URLSearchParams;
  v: Record<string, string>;
  body: unknown;
  events: LocalEvent[];
  uploadedIds: number[];
  options: OperationOptions;
  now: string;
  user(): number;
}
export type Operation = (c: Context) => unknown | Promise<unknown>;
export interface Route { method: string; path: string; run: Operation; public: boolean; mutates: boolean }
export const route = (method: string, path: string, run: Operation, isPublic = false, mutates = method !== 'GET'): Route => ({ method, path, run, public: isPublic, mutates });
export const id = (c: Context, key = 'id'): number => integer(c.v[key]);
export function owner(c: Context, userId: number): void { need(c.user() === userId, 'This action belongs to another user', 403); }
export function favorites(s: DemoState, userId: number): DemoPlaylist | undefined { return s.playlists.find(p => p.creatorId === userId && p.isProtected); }
export function trackView(c: Context, track: DemoTrack) {
  const album = byId(c.s.albums, track.albumId, 'Album');
  return { ...track, durationInSeconds: durationSeconds(track.duration), albumName: album.name, isFavorite: favorites(c.s, c.s.session?.userId ?? 0)?.trackIds.includes(track.id) ?? false,
    artists: track.artistIds.map(artistId => { const a = byId(c.s.artists, artistId, 'Artist'); const u = byId(c.s.users, a.userId, 'User'); return { id: a.id, artistId: a.id, artistName: a.artistName, pseudonym: a.artistName, user: { firstName: u.firstName, lastName: u.lastName } }; }) };
}
export function playlistView(c: Context, p: DemoPlaylist) { return { ...p, creator: { id: p.creatorId }, creatorName: byId(c.s.users, p.creatorId).userName, trackCount: p.trackIds.length, tracks: p.trackIds.map(t => trackView(c, byId(c.s.tracks, t))), contributorNames: (p.contributors ?? []).map(u => byId(c.s.users, u.id).userName), isFavorite: c.s.folders.some(f => f.ownerId === c.s.session?.userId && f.collectionIds.includes(p.id)) }; }
export function albumView(c: Context, albumId: number) { const album = byId(c.s.albums, albumId, 'Album'); return { ...album, albumArtists: album.artistIds.map(artistId=>({id:artistId,artistId,albumId:album.id,pseudonym:byId(c.s.artists,artistId).artistName})), trackCount: album.trackIds.length, tracks: album.trackIds.map(t => trackView(c, byId(c.s.tracks, t))), authors: album.artistIds.map(a => ({ artistId: a, pseudonym: byId(c.s.artists, a).artistName })) }; }
export function folderView(c: Context, f: DemoFolder) { const children = c.s.folders.filter(v => v.parentFolderId === f.id); return { ...f, parentFolderName: c.s.folders.find(v => v.id === f.parentFolderId)?.name, subFolders: children.map(v => ({ id: v.id, name: v.name, isProtected: v.isProtected, subFolderCount: c.s.folders.filter(w => w.parentFolderId === v.id).length, collectionCount: v.collectionIds.length })), collections: f.collectionIds.map(collectionId => { const collection = c.s.albums.find(v => v.id === collectionId) ?? byId(c.s.playlists, collectionId, 'Collection'); return { id: collection.id, name: collection.name, coverId: collection.coverId, type: c.s.albums.some(v => v.id === collectionId) ? 'Album' : 'Playlist' }; }) }; }
export function collection(c: Context, collectionId: number) { return c.s.albums.find(a => a.id === collectionId) ?? byId(c.s.playlists, collectionId, 'Collection'); }
export function root(c: Context): DemoFolder { const userId = c.user(); const folder = c.s.folders.find(f => f.ownerId === userId && f.parentFolderId == null); need(folder, 'Root folder is missing', 409); return folder!; }
export function playlistOwner(c: Context): DemoPlaylist { const p = byId(c.s.playlists, id(c), 'Playlist'); need(p.creatorId === c.user() || p.contributors?.some(u => u.id === c.user()), 'Playlist is read only for this user', 403); return p; }
export function visible(c: Context, status: number, ownerId?: number): void { need(status === 1 || ownerId === c.s.session?.userId, 'This entity is private', 403); }
export function pageBounds(c: Context, defaultLimit = 20): { limit: number; offset: number } { const limit = c.p.has('limit') ? integer(c.p.get('limit'), 'Limit') : c.p.has('take') ? integer(c.p.get('take'), 'Take') : defaultLimit; need(limit <= 100, 'Limit must be at most 100'); const offset = Number(c.p.get('offset') ?? 0); need(Number.isSafeInteger(offset) && offset >= 0, 'Offset must be a nonnegative integer'); return { limit, offset }; }
export function offsetPage<T>(c: Context, rows: T[]) { const { limit, offset } = pageBounds(c); return { total: rows.length, items: rows.slice(offset, offset + limit) }; }
export function cursorPage<T>(c: Context, rows: T[], key: (row: T) => string) { const { limit } = pageBounds(c); const cursor = c.p.get('after') ?? c.p.get('cursor'); let offset = 0; if (cursor) { const index = rows.findIndex(row => key(row) === cursor); need(index >= 0, 'Invalid or expired cursor'); offset = index + 1; } const items = rows.slice(offset, offset + limit); const hasMore = offset + items.length < rows.length; const next = hasMore && items.length ? key(items[items.length - 1]) : null; return { items, after: next, next, nextCursor: next, limit, hasMore }; }
export function sorted<T>(c: Context, rows: T[], value: (v: T, sort: string) => string | number): T[] { const sort = c.p.get('sort') ?? c.p.get('sortBy'); if (!sort) return rows; const direction = (c.p.get('order') ?? c.p.get('sortOrder'))?.toLowerCase() === 'desc' ? -1 : 1; return [...rows].sort((a, b) => { const x = value(a, sort), y = value(b, sort); return (typeof x === 'number' && typeof y === 'number' ? x - y : String(x).localeCompare(String(y))) * direction; }); }
export async function upload(c: Context, fields = ['file', 'coverFile', 'cover'], mime = 'image/'): Promise<number> { const body = record(c.body); const value = Object.entries(body).find(([key]) => fields.some(f => f.toLowerCase() === key.toLowerCase()))?.[1]; need(value instanceof Blob && value.size > 0, 'A nonempty file is required'); need((value as Blob).size <= 20 * 1024 * 1024, 'Upload limit is 20 MiB'); need((value as Blob).type.startsWith(mime), `Expected ${mime} upload`); need(c.options.storeBlob, 'Binary storage is unavailable', 503); const mediaId = c.s.nextId++; try { await c.options.storeBlob!(mediaId, value as Blob); } catch (error) { throw new MockError(507, `Local file could not be saved: ${error instanceof Error ? error.message : String(error)}`, 'MOCK_STORAGE'); } c.uploadedIds.push(mediaId); return mediaId; }
export function sharedUrl(c: Context, kind: string, entityId: number): string { const type = kind.toLowerCase(); if (type === 'track') byId(c.s.tracks, entityId, 'Track'); else if (type === 'user') byId(c.s.users, entityId, 'User'); else if (type === 'artist') byId(c.s.artists, entityId, 'Artist'); else if(type==='album') byId(c.s.albums,entityId,'Album'); else if(type==='playlist') byId(c.s.playlists,entityId,'Playlist'); else throw new MockError(404,`Blend ${entityId} was not found`,'MOCK_NOT_FOUND'); const base = c.options.baseUrl ?? '/Sonar-front-end/'; const target=type==='user'?byId(c.s.users,entityId,'User').publicIdentifier:String(entityId); return `${c.options.origin ?? 'http://localhost'}${base}#/${type}/${encodeURIComponent(target)}`; }
export function detachCollection(c: Context, collectionId: number): void { c.s.folders.forEach(f => { f.collectionIds = f.collectionIds.filter(v => v !== collectionId); }); c.s.recentCollections = c.s.recentCollections.filter(v => v.collectionId !== collectionId); for (const q of Object.values(c.s.queues)) if (q.collectionId === collectionId) q.collectionId = null; }
export function snapshot<T>(value: T): T { return clone(value); }
