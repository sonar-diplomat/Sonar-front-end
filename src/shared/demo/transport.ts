import { accountRoutes } from './accounts.ts';
import { administrationRoutes } from './administration.ts';
import { catalogRoutes } from './catalog.ts';
import { clone,validateSeed,validateState,type DemoScenario,type DemoSeed,type DemoState,type LocalEvent,type MockRequest,type MockResult } from './database.ts';
import { MockError,type Context,type OperationOptions,type Route } from './operations.ts';
import { DemoPersistence,type DemoStorage } from './persistence.ts';
import { socialRoutes } from './social.ts';

const routes = [...catalogRoutes, ...socialRoutes, ...accountRoutes, ...administrationRoutes].sort((a, b) => b.path.split('/').filter(s => !s.startsWith(':')).length - a.path.split('/').filter(s => !s.startsWith(':')).length);
export const mockRouteInventory = routes.map(({ method, path }) => ({ method, path }));
export interface TransportOptions extends OperationOptions { seed: DemoSeed; storage?: DemoStorage; scenario?: DemoScenario; onEvent?: (event: LocalEvent) => void; runExclusive?: <T>(action: () => Promise<T>) => Promise<T> }
function bodyValue(body: unknown): unknown {
  if (typeof FormData !== 'undefined' && body instanceof FormData) return Object.fromEntries([...body.entries()].map(([key, value]) => [key[0].toLowerCase() + key.slice(1), value]));
  if (typeof body === 'string') { try { return JSON.parse(body); } catch { return body; } }
  return body;
}
function matchRoute(route: Route, path: string): Record<string, string> | null { const expected = route.path.split('/'), actual = path.split('/'); if (actual.length !== expected.length) return null; const vars: Record<string, string> = {}; for (let i = 0; i < expected.length; i++) { if (expected[i].startsWith(':')) vars[expected[i].slice(1)] = decodeURIComponent(actual[i]); else if (expected[i].toLowerCase() !== actual[i].toLowerCase()) return null; } return vars; }
export function createMockTransport(options: TransportOptions) {
  validateSeed(options.seed);
  const persistence = new DemoPersistence(options.storage);
  const initial = clone(options.seed.state);
  let state = persistence.load(initial);
  if (options.scenario === 'empty') { state.tracks = []; state.albums = []; state.playlists = state.playlists.filter(p => p.isProtected).map(p => ({ ...p, trackIds: [] })); state.folders.forEach(f => { f.collectionIds = f.collectionIds.filter(id => state.playlists.some(p => p.id === id)); }); state.posts = []; state.chats = []; state.messages = []; state.recentTracks = []; state.recentCollections = []; Object.values(state.queues).forEach(q => { q.trackIds = []; q.currentTrackId = null; q.collectionId = null; }); }
  if (persistence.status.reset) persistence.save(state);
  let pending: Promise<unknown> = Promise.resolve();
  function enqueue<T>(action: () => Promise<T>): Promise<T> { const exclusive = () => options.runExclusive ? options.runExclusive(action) : action(); const operation = pending.then(exclusive, exclusive); pending = operation.catch(() => undefined); return operation; }
  function emit(event: LocalEvent) { options.onEvent?.(event); }
  function reloadLatest(): void {
    if (!options.storage || !persistence.status.persistent || (options.scenario && options.scenario !== 'default')) return;
    const latest = persistence.load(initial, state);
    if (JSON.stringify(latest) !== JSON.stringify(state)) {
      const reset = latest.revision < state.revision;
      state = latest;
      emit({ name: 'state.external', payload: { revision: state.revision, reset } });
    }
  }
  async function execute(request: MockRequest): Promise<MockResult> {
    const method = (request.method ?? 'GET').toUpperCase();
    let path = request.url;
    const uploadedIds: number[] = [];
    try {
      if (request.signal?.aborted) throw new MockError(499, 'Mock request aborted', 'MOCK_ABORTED');
      if (options.scenario === 'error') throw new MockError(503, 'Explicit demo error scenario', 'MOCK_SCENARIO_ERROR');
      reloadLatest();
      const url = new URL(request.url, 'https://mock.invalid/api/');
      path = url.pathname.replace(/^\/+/, '').replace(/^api\//i, '').replace(/\/+$/, '');
      const params = url.searchParams;
      for (const [key, value] of Object.entries(request.params ?? {})) if (value !== undefined && value !== null) params.set(key, Array.isArray(value) ? value.join(',') : String(value));
      let found: Route | undefined, vars: Record<string, string> | null = null;
      for (const candidate of routes) if (candidate.method === method) { const match = matchRoute(candidate, path); if (match) { found = candidate; vars = match; break; } }
      if (!found || !vars) throw new MockError(404, `Unhandled mock endpoint: ${method} ${path}`, 'MOCK_ENDPOINT_NOT_FOUND');
      const baseline = JSON.stringify(state);
      const draft = clone(state), events: LocalEvent[] = [];
      const context: Context = { s: draft, p: params, v: vars, body: bodyValue(request.body), events, uploadedIds, options, now: (options.now ?? (() => new Date().toISOString()))(), user: () => { if (!draft.session) throw new MockError(401, 'Enter the local demo session first', 'MOCK_UNAUTHENTICATED'); return draft.session.userId; } };
      if (!found.public) context.user();
      const data = await found.run(context);
      if (request.signal?.aborted) throw new MockError(499, 'Mock request aborted', 'MOCK_ABORTED');
      if (found.mutates && options.storage && persistence.status.persistent && JSON.stringify(persistence.load(initial, state)) !== baseline) {
        reloadLatest();
        throw new MockError(409, 'Demo data changed in another tab. Retry this action with the refreshed data.', 'MOCK_CONFLICT_RETRY');
      }
      if (found.mutates && JSON.stringify(draft) !== JSON.stringify(state)) { draft.revision++; validateState(draft); state = draft; persistence.save(state); events.push({ name: 'state.changed', payload: { revision: state.revision, method, path } }); }
      for (const event of events) emit(clone(event));
      return { success: true, status: 200, message: 'Local demo operation completed', ...(data === undefined ? {} : { data: clone(data) }) };
    } catch (error) {
      if (options.deleteBlob) await Promise.allSettled(uploadedIds.map(mediaId => options.deleteBlob!(mediaId)));
      const e = error instanceof MockError ? error : new MockError(500, error instanceof Error ? error.message : 'Unexpected mock error', 'MOCK_INTERNAL');
      return { success: false, status: e.status, message: e.message, errors: [e.message], details: [e.code, `${method} ${path}`] };
    }
  }
  return {
    dispatch: (request: MockRequest): Promise<MockResult> => enqueue(() => execute(request)),
    getSnapshot: (): DemoState => clone(state),
    getStatus: () => ({ ...persistence.status }),
    synchronize: (): Promise<void> => enqueue(async () => { reloadLatest(); }),
    reset: (beforeReset?: () => Promise<void>): Promise<void> => enqueue(async () => { await beforeReset?.(); state = clone(initial); persistence.save(state); emit({ name: 'state.reset', payload: { revision: 0 } }); }),
  };
}
export type MockTransport = ReturnType<typeof createMockTransport>;
