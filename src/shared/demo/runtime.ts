import { rtkApi } from '../api/rtkApi';
import { store } from '../store';
import type { RequestConfig } from '../types/api';

import { clearUploadedMedia,getCachedUploadedMediaUrl,hydrateUploadedMedia, releaseUploadedMediaUrls } from './blobs.ts';
import type { DemoState } from './database.ts';
import { STORAGE_KEY } from './database.ts';
import { subscribeDemoEvents } from './events.ts';
import { dispatchMock,getDemoTransport } from './handlers.ts';
import { resolveDemoAudioUrl,resolveDemoImageUrl } from './media';
import { features,folderView,type Context } from './operations.ts';
export { getCachedUploadedMediaUrl,getUploadedMediaUrl } from './blobs.ts';
export { subscribeDemoEvents } from './events.ts';

let bootstrapPromise: Promise<void> | undefined;
let binaryWarning: string | null = null;
function synchronizePlayback(state: DemoState, userId: number | undefined): void {
  const queue = userId ? state.queues[userId] : undefined;
  if (queue?.currentTrackId) store.dispatch({ type: 'userState/setListeningTarget', payload: { trackId: queue.currentTrackId, collectionId: queue.collectionId ?? undefined } });
  else store.dispatch({ type: 'userState/clearUserState' });
  if (queue) { store.dispatch({ type: 'userState/setCurrentPosition', payload: queue.position }); store.dispatch({ type: 'userState/setStatus', payload: queue.statusId }); }
}
function synchronize(playbackOnly = false): void {
  const state = getDemoTransport().getSnapshot(), userId = state.session?.userId;
  if (playbackOnly) { synchronizePlayback(state, userId); return; }
  store.dispatch({ type: 'auth/setDemoSession', payload: state.session });
  store.dispatch({ type: 'library/clearCache' });
  if (userId) {
    store.dispatch({ type: 'clientSettings/setSettings', payload: state.settings[userId] });
    store.dispatch({ type: 'access/setAllAccessFeatures', payload: features });
    store.dispatch({ type: 'access/setUserAccessFeatures', payload: state.users.find(u => u.id === userId)?.accessFeatures ?? [] });
    const context = { s: state } as Context;
    const folders = state.folders.filter(f => f.ownerId === userId).map(f => folderView(context, f));
    store.dispatch({ type: 'library/setFoldersList', payload: folders });
    folders.forEach(folder => { store.dispatch({ type: 'library/setFolder', payload: folder }); });
    synchronizePlayback(state, userId);
  } else {
    store.dispatch({ type: 'clientSettings/clearSettings' });
    store.dispatch({ type: 'access/clearAccess' });
    store.dispatch({ type: 'userState/clearUserState' });
  }
}
export function bootstrapDemo(): Promise<void> {
  return bootstrapPromise ??= (async () => {
    const transport = getDemoTransport();
    try { if (transport.getStatus().reset) await clearUploadedMedia(); await hydrateUploadedMedia(); }
    catch (error) { binaryWarning = error instanceof Error ? error.message : 'Uploaded files are unavailable'; }
    subscribeDemoEvents(event => {
      if (event.name === 'state.reset') { store.dispatch(rtkApi.util.resetApiState()); store.dispatch({ type: 'search/clearCache' }); synchronize(); return; }
      if (event.name === 'state.external') {
        const reset = (event.payload as { reset: boolean }).reset;
        if (reset) { releaseUploadedMediaUrls(); store.dispatch(rtkApi.util.resetApiState()); window.dispatchEvent(new Event('sonar-demo:reset')); }
        synchronize(); store.dispatch({ type: 'search/clearCache' }); store.dispatch(rtkApi.util.invalidateTags(['DemoState']));
        void hydrateUploadedMedia().then(() => { store.dispatch(rtkApi.util.invalidateTags(['DemoState'])); }).catch(error => { binaryWarning = error instanceof Error ? error.message : String(error); });
        return;
      }
      if (event.name !== 'state.changed') return;
      const path = (event.payload as { path: string }).path.toLowerCase();
      synchronize(path.startsWith('userstate/'));
      if (path === 'userstate/current-position' || path.startsWith('userstate/status') || path === 'userstate/session') return;
      if (path === 'userstate/queue') store.dispatch(rtkApi.util.invalidateTags(['Queue']));
      else { store.dispatch({ type: 'search/clearCache' }); store.dispatch(rtkApi.util.invalidateTags(['DemoState'])); }
    });
    window.addEventListener('storage', event => { if (event.key === STORAGE_KEY || event.key === null) void transport.synchronize(); });
    synchronize();
  })();
}
export async function resetDemoState(): Promise<void> {
  await bootstrapDemo();
  await getDemoTransport().reset(async () => {
    await clearUploadedMedia();
    try { for (let i = localStorage.length - 1; i >= 0; i--) { const key = localStorage.key(i); if (key?.startsWith('sonar-demo:') && key !== 'sonar-demo:state') localStorage.removeItem(key); } }
    catch { /* Storage status is exposed by getDemoStatus. */ }
  });
  window.dispatchEvent(new Event('sonar-demo:reset'));
}
export async function enterDemoSession(): Promise<void> { await bootstrapDemo(); const result = await dispatchMock({ url: 'Demo/session', method: 'POST' }); if (!result.success) throw new Error(result.message); }
export async function leaveDemoSession(): Promise<void> { await dispatchMock({ url: 'Demo/session', method: 'DELETE' }); store.dispatch(rtkApi.util.resetApiState()); }
export function getDemoOutbox() { return getDemoTransport().getSnapshot().outbox; }
export function getDemoStatus() { return { ...getDemoTransport().getStatus(), binaryWarning }; }

export async function downloadDemo(endpoint: string, config: RequestConfig = {}): Promise<Response> {
  const path = new URL(endpoint, 'https://mock.invalid/api/').pathname.replace(/^\/api\//i, '').replace(/^\//, '');
  const image = /^blob\/(\d+)$/i.exec(path), stream = /^Track\/(\d+)\/stream$/i.exec(path);
  let url: string | null | undefined;
  if (image) url = getCachedUploadedMediaUrl(Number(image[1])) ?? resolveDemoImageUrl(Number(image[1]));
  if (stream) {
    const t = getDemoTransport().getSnapshot().tracks.find(t => t.id === Number(stream[1]));
    if (t) {
      const quality = Number(config.params?.playbackQualityId ?? 2);
      const audioId = quality === 3 ? t.highQualityAudioFileId ?? t.lowQualityAudioFileId : quality === 2 ? t.mediumQualityAudioFileId ?? t.lowQualityAudioFileId : t.lowQualityAudioFileId;
      url = getCachedUploadedMediaUrl(audioId) ?? resolveDemoAudioUrl(t.id, audioId);
    }
  }
  if (image || stream) {
    if (!url) return Response.json({ success: false, status: 404, message: `Demo media missing: ${path}` }, { status: 404 });
    return fetch(url, { signal: config.signal, headers: config.headers });
  }
  const result = await dispatchMock({ url: endpoint, method: config.method, params: config.params, body: config.body, signal: config.signal ?? undefined });
  if (result.success && typeof result.data === 'string' && /\/(?:share-)?qr$/i.test(path)) return new Response(result.data, { headers: { 'Content-Type': 'image/svg+xml' } });
  return Response.json(result, { status: result.status });
}
