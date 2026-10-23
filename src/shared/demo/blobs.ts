let urls: Map<number, string> | undefined;
const cachedUrls = () => urls ??= new Map<number, string>();
let connection: Promise<IDBDatabase> | undefined;
function database(): Promise<IDBDatabase> {
  if (typeof indexedDB === 'undefined') return Promise.reject(new Error('IndexedDB is unavailable; local uploads cannot be saved.'));
  return connection ??= new Promise((resolve, reject) => {
    const request = indexedDB.open('sonar-demo', 1);
    request.onupgradeneeded = () => { if (!request.result.objectStoreNames.contains('uploads')) request.result.createObjectStore('uploads', { keyPath: 'id' }); };
    request.onsuccess = () => { request.result.onversionchange = () => { request.result.close(); connection = undefined; }; resolve(request.result); };
    request.onerror = () => { connection = undefined; reject(request.error ?? new Error('Cannot open local upload storage')); };
    request.onblocked = () => { connection = undefined; reject(new Error('Close other demo tabs to upgrade upload storage.')); };
  });
}
export function getCachedUploadedMediaUrl(id: number): string | null { return urls?.get(id) ?? null; }
function cache(id: number, blob: Blob): string { const old = urls?.get(id); if (old) URL.revokeObjectURL(old); const url = URL.createObjectURL(blob); cachedUrls().set(id, url); return url; }
export async function putUploadedBlob(id: number, blob: Blob): Promise<void> {
  const db = await database();
  await new Promise<void>((resolve, reject) => { const tx = db.transaction('uploads', 'readwrite'); tx.objectStore('uploads').add({ id, blob }); tx.oncomplete = () => resolve(); tx.onerror = () => reject(tx.error ?? new Error('Cannot save uploaded file')); tx.onabort = () => reject(tx.error ?? new Error('Upload storage transaction aborted')); });
  cache(id, blob);
}
export async function deleteUploadedBlob(id: number): Promise<void> {
  const db = await database();
  await new Promise<void>((resolve, reject) => { const tx = db.transaction('uploads', 'readwrite'); tx.objectStore('uploads').delete(id); tx.oncomplete = () => resolve(); tx.onerror = () => reject(tx.error); tx.onabort = () => reject(tx.error); });
  const url = urls?.get(id); if (url) URL.revokeObjectURL(url); urls?.delete(id);
}
export async function hydrateUploadedMedia(): Promise<void> {
  const db = await database(); const rows = await new Promise<{ id: number; blob: Blob }[]>((resolve, reject) => { const request = db.transaction('uploads').objectStore('uploads').getAll(); request.onsuccess = () => resolve(request.result as { id: number; blob: Blob }[]); request.onerror = () => reject(request.error); });
  rows.forEach(row => { if (!urls?.has(row.id)) cache(row.id, row.blob); });
}
export async function getUploadedMediaUrl(id: number): Promise<string | null> { if (urls?.has(id)) return urls.get(id)!; const db = await database(); const row = await new Promise<{ blob: Blob } | undefined>((resolve, reject) => { const request = db.transaction('uploads').objectStore('uploads').get(id); request.onsuccess = () => resolve(request.result as { blob: Blob } | undefined); request.onerror = () => reject(request.error); }); return row ? cache(id, row.blob) : null; }
export function releaseUploadedMediaUrls(): void { for (const url of urls?.values() ?? []) URL.revokeObjectURL(url); urls?.clear(); }
export async function clearUploadedMedia(): Promise<void> { releaseUploadedMediaUrls(); if (typeof indexedDB === 'undefined') return; const db = await database(); await new Promise<void>((resolve, reject) => { const tx = db.transaction('uploads', 'readwrite'); tx.objectStore('uploads').clear(); tx.oncomplete = () => resolve(); tx.onerror = () => reject(tx.error); tx.onabort = () => reject(tx.error); }); }
