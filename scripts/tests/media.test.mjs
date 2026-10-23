import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { createServer } from 'node:http';
import { safeMediaPath, sha256, selectAudio, verifyFile } from '../media-lib.mjs';
import { staticMiddleware } from '../static-server.mjs';
import { demoMediaPlugin } from '../demo-media-plugin.mjs';

test('dev media middleware leaves JSON source imports to Vite', async () => {
  const plugin = demoMediaPlugin();
  plugin.configResolved({ root: process.cwd(), base: '/Sonar-front-end/' });
  const middlewares = [];
  await plugin.configureServer({ middlewares: { use: middleware => middlewares.push(middleware) } });
  for (const url of ['/Sonar-front-end/demo/media-manifest.json?import', '/Sonar-front-end/demo/data/seed.json?import&t=1']) {
    let continued = false;
    await middlewares.at(-1)({ url }, {}, () => { continued = true; });
    assert.equal(continued, true);
  }
});

test('media paths reject traversal, remote URLs, hidden files and ambiguous separators', () => {
  for (const value of ['../secret', '/audio/1.mp3', 'https://example.com/a.mp3', 'audio/../secret', 'audio//1.mp3', 'audio/.hidden', 'audio\\1.mp3', 'demo/audio/1.mp3']) assert.throws(() => safeMediaPath(value));
  assert.equal(safeMediaPath('audio/1.mp3'), 'audio/1.mp3');
  assert.throws(() => selectAudio({ audio: [{ id: 1 }] }, '2'));
  assert.throws(() => selectAudio({ audio: [{ id: 1 }] }, '1,1'));
});

test('verifier rejects pointers, changed bytes and wrong size before publication', async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'sonar-media-'));
  try {
    const filename = path.join(root, '1.mp3');
    const pointer = Buffer.from('version https://git-lfs.github.com/spec/v1\noid sha256:abc\nsize 10\n');
    await writeFile(filename, pointer);
    const entry = { path: 'audio/1.mp3', bytes: pointer.length, sha256: sha256(pointer), mime: 'audio/mpeg' };
    await assert.rejects(verifyFile(filename, entry), /LFS pointer/);
    await writeFile(filename, Buffer.from('changed-content'));
    await assert.rejects(verifyFile(filename, entry), /Size mismatch/);
    await assert.rejects(verifyFile(filename, { ...entry, bytes: 15 }), /SHA-256 mismatch/);
  } finally { await rm(root, { recursive: true, force: true }); }
});

test('HTTP serves exact bytes with base, HEAD, middle/suffix ranges; rejects invalid ranges and pointers', async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'sonar-http-'));
  const content = Buffer.from('0123456789abcdefghijklmnopqrstuvwxyz');
  await writeFile(path.join(root, '1.mp3'), content);
  await writeFile(path.join(root, 'pointer.mp3'), 'version https://git-lfs.github.com/spec/v1\n');
  const server = createServer(staticMiddleware(root, { base: '/project/' }));
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const base = `http://127.0.0.1:${server.address().port}/project/`;
  try {
    const full = await fetch(`${base}1.mp3`);
    assert.equal(full.status, 200); assert.equal(full.headers.get('content-type'), 'audio/mpeg');
    assert.deepEqual(Buffer.from(await full.arrayBuffer()), content);
    const head = await fetch(`${base}1.mp3`, { method: 'HEAD' });
    assert.equal(head.headers.get('content-length'), String(content.length)); assert.equal((await head.arrayBuffer()).byteLength, 0);
    const range = await fetch(`${base}1.mp3`, { headers: { Range: 'bytes=10-14' } });
    assert.equal(range.status, 206); assert.equal(range.headers.get('content-range'), 'bytes 10-14/36'); assert.equal(await range.text(), 'abcde');
    const suffix = await fetch(`${base}1.mp3`, { headers: { Range: 'bytes=-3' } });
    assert.equal(suffix.status, 206); assert.equal(await suffix.text(), 'xyz');
    for (const value of ['bytes=90-', 'bytes=4-2', 'bytes=1-2,4-5', 'bytes=-0']) assert.equal((await fetch(`${base}1.mp3`, { headers: { Range: value } })).status, 416);
    assert.equal((await fetch(`${base}pointer.mp3`)).status, 503);
    assert.equal((await fetch(`${base}missing.mp3`)).status, 404);
    assert.equal((await fetch(`${base}.env`)).status, 404);
    assert.equal((await fetch(`${base}1.mp3`, { method: 'POST' })).status, 405);
    assert.equal((await fetch(base.replace('/project/', '/1.mp3'))).status, 404);
  } finally { await new Promise(resolve => server.close(resolve)); await rm(root, { recursive: true, force: true }); }
});
