import { putUploadedBlob,deleteUploadedBlob } from './blobs.ts';
import type { MockRequest } from './database.ts';
import { emitDemoEvent } from './events.ts';
import { loadSeed } from './load-seed.ts';
import {resolveDemoImageUrl} from './media';
import { createMockTransport,type MockTransport } from './transport.ts';
let transport: MockTransport | undefined;
export function getDemoTransport(): MockTransport {
  if (!transport) {
    let storage: Storage | undefined;
    try { storage = window.localStorage; } catch { /* Memory mode is reported through getStatus(). */ }
    transport = createMockTransport({ seed: loadSeed(), storage, baseUrl: import.meta.env.BASE_URL, origin: window.location.origin, storeBlob: putUploadedBlob,deleteBlob:deleteUploadedBlob, imageUrl: resolveDemoImageUrl, onEvent: emitDemoEvent, runExclusive: async action => { if (navigator.locks) return await navigator.locks.request('sonar-demo:state', action); return await action(); }, qr: async url => { const QRCode = await import('qrcode'); return QRCode.toString(url, { type: 'svg', errorCorrectionLevel: 'M' }); } });
  }
  return transport;
}
export const dispatchMock = (request: MockRequest) => getDemoTransport().dispatch(request);
