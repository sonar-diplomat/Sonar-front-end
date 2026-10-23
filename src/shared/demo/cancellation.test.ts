import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import ts from 'typescript';

import { requestFetch } from '../api/requestFetch.ts';

const pendingFetch = (_input: RequestInfo | URL, init?: RequestInit): Promise<Response> => new Promise((_, reject) => {
  const signal = init?.signal;
  if (signal?.aborted) { reject(signal.reason); return; }
  signal?.addEventListener('abort', () => reject(signal.reason), { once: true });
});

test('pre-aborted requests never start fetch and external cancellation interrupts a pending request', async () => {
  const original = globalThis.fetch; let attempts = 0;
  globalThis.fetch = (input, init) => { attempts++; return pendingFetch(input, init); };
  try {
    const before = new AbortController(); before.abort();
    await assert.rejects(requestFetch('https://api.example.test', { signal: before.signal }, 100), { name: 'AbortError' }); assert.equal(attempts, 0);
    const active = new AbortController(); const pending = requestFetch('https://api.example.test', { signal: active.signal }, 100); active.abort();
    await assert.rejects(pending, { name: 'AbortError' }); assert.equal(attempts, 1);
  } finally { globalThis.fetch = original; }
});

test('timeouts cancel pending fetch while completed requests clear their deadline', async () => {
  const original = globalThis.fetch;
  try {
    globalThis.fetch = pendingFetch;
    await assert.rejects(requestFetch('https://api.example.test', {}, 5), { name: 'TimeoutError' });
    let captured: AbortSignal | null = null;
    globalThis.fetch = async (_input, init) => { captured = init?.signal ?? null; return new Response('done'); };
    const response = await requestFetch('https://api.example.test', {}, 5); assert.equal(await response.text(), 'done');
    await new Promise(resolve => setTimeout(resolve, 20)); assert.equal((captured as AbortSignal | null)?.aborted, false);
  } finally { globalThis.fetch = original; }
});

test('caller cancellation remains attached to the response body after headers and timeout cleanup', async () => {
  const original = globalThis.fetch;
  globalThis.fetch = async (_input, init) => new Response(new ReadableStream({ start(controller) { const signal = init?.signal; signal?.addEventListener('abort', () => controller.error(signal.reason), { once: true }); } }));
  try {
    const caller = new AbortController(); const response = await requestFetch('https://api.example.test/audio', { signal: caller.signal }, 1000);
    const body = response.text(); caller.abort(); await assert.rejects(body, { name: 'AbortError' });
  } finally { globalThis.fetch = original; }
});

async function loadServerAdapter(name: 'oldBaseApi' | 'rtkBaseQuery'): Promise<unknown> {
  const url = new URL(`../api/${name}.ts`, import.meta.url); let source = await readFile(url, 'utf8');
  const parsed = ts.createSourceFile(name, source, ts.ScriptTarget.Latest, true);
  const imports = parsed.statements.filter(ts.isImportDeclaration);
  for (const statement of [...imports].reverse()) {
    const replacement = statement.moduleSpecifier.getText(parsed).includes('requestFetch') ? `import { requestFetch } from '${new URL('../api/requestFetch.ts', import.meta.url).href}';` : '';
    source = source.slice(0, statement.getStart(parsed)) + replacement + source.slice(statement.end);
  }
  const environment = `const isDemoMode=false; const API_BASE_URL='https://api.example.test/'; const MEDIA_BASE_URL=API_BASE_URL; const authManager={getAccessToken:()=>null,getRefreshToken:()=>null,isAuthenticated:()=>false,handleUnauthorized:async()=>{},refreshAccessToken:async()=>null}; const shouldRefreshToken=()=>false; const toSearchParams=p=>new URLSearchParams(p); const normalizeResponse=(raw,status)=>({...raw,status});`;
  const js = ts.transpileModule(environment + source.replaceAll('import.meta.env', '({DEV:false})'), { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText;
  return import(`data:text/javascript;base64,${Buffer.from(js).toString('base64')}`);
}

test('real legacy and RTK server adapters honor cancellation without retrying the request', async () => {
  const original = globalThis.fetch; let attempts = 0;
  globalThis.fetch = (input, init) => { attempts++; return pendingFetch(input, init); };
  try {
    type Config = { signal: AbortSignal; retries: number; withAuth: boolean; retryDelayMs: () => number };
    const { apiClient } = await loadServerAdapter('oldBaseApi') as { apiClient: { get: (path: string, cfg: Config) => Promise<{ status: number }>; download: (path: string, cfg: Config) => Promise<Response> } };
    const caller = new AbortController(); const result = apiClient.get('slow', { signal: caller.signal, retries: 5, withAuth: false, retryDelayMs: () => 0 }); caller.abort(); assert.equal((await result).status, 499); assert.equal(attempts, 1);
    const download = new AbortController(); const pending = apiClient.download('audio', { signal: download.signal, retries: 5, withAuth: false, retryDelayMs: () => 0 }); download.abort(); await assert.rejects(pending, { name: 'AbortError' }); assert.equal(attempts, 2);
    const { rtkBaseQuery } = await loadServerAdapter('rtkBaseQuery') as { rtkBaseQuery: (args: { url: string; withAuth: boolean; retries: number }, api: { signal: AbortSignal }, extra: object) => Promise<{ error?: { status: number } }> };
    const query = new AbortController(); const rtk = rtkBaseQuery({ url: 'slow', withAuth: false, retries: 5 }, { signal: query.signal }, {}); query.abort(); assert.equal((await rtk).error?.status, 499); assert.equal(attempts, 3);
  } finally { globalThis.fetch = original; }
});

test('legacy and RTK body parsing preserve cancellation for JSON and text instead of invalid-response success', async () => {
  const original = globalThis.fetch;
  try {
    const { apiClient } = await loadServerAdapter('oldBaseApi') as { apiClient: { get: (url: string, cfg: { withAuth: boolean; signal: AbortSignal; retries: number }) => Promise<{ status: number }> } };
    const { rtkBaseQuery } = await loadServerAdapter('rtkBaseQuery') as { rtkBaseQuery: (args: { url: string; withAuth: boolean; retries: number; signal?: AbortSignal }, api: { signal: AbortSignal }, extra: object) => Promise<{ error?: { status: number } }> };
    for (const contentType of ['application/json', 'text/plain']) {
      let attempts = 0;
      globalThis.fetch = async (_input, init) => { attempts++; return new Response(new ReadableStream({ start(controller) { const signal = init?.signal; signal?.addEventListener('abort', () => controller.error(signal.reason), { once: true }); } }), { headers: { 'content-type': contentType } }); };
      const external = new AbortController(); const legacy = apiClient.get('body', { withAuth: false, signal: external.signal, retries: 5 });
      await new Promise(resolve => setTimeout(resolve, 0)); external.abort(); assert.equal((await legacy).status, 499); assert.equal(attempts, 1);
      const query = new AbortController(), extra = new AbortController(); const result = rtkBaseQuery({ url: 'body', withAuth: false, retries: 5, signal: extra.signal }, { signal: query.signal }, {});
      await new Promise(resolve => setTimeout(resolve, 0)); query.abort(); assert.equal((await result).error?.status, 499); assert.equal(attempts, 2);
    }
  } finally { globalThis.fetch = original; }
});
