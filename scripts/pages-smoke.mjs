import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { previewPages } from './pages.mjs';
import { readJson, sha256, invariant } from './media-lib.mjs';

let server;
try {
  const directory = process.env.PAGES_DIR || '.pages';
  server = await previewPages({ directory, port: 0 });
  const profile = await readJson(path.join(directory, 'build-profile.json'));
  const manifest = await readJson(path.join(directory, 'demo/media-manifest.json'));
  const origin = `http://127.0.0.1:${server.address().port}`;
  const root = `${origin}${profile.base}`;
  const checks = [];
  for (const filename of ['', 'media-credits.html', 'demo/licenses.json']) {
    const response = await fetch(root + filename);
    invariant(response.status === 200, `Page HTTP ${response.status}: ${filename}`);
    await response.arrayBuffer();
  }
  for (const entry of [...manifest.audio, ...manifest.images]) {
    const url = `${root}demo/${entry.path}`;
    const full = await fetch(url);
    invariant(full.status === 200 && full.headers.get('content-type')?.split(';')[0] === entry.mime, `HTTP/MIME mismatch: ${entry.path}`);
    const bytes = Buffer.from(await full.arrayBuffer());
    invariant(bytes.length === entry.bytes && sha256(bytes) === entry.sha256, `HTTP size/hash mismatch: ${entry.path}`);
    const head = await fetch(url, { method: 'HEAD' });
    invariant(head.status === 200 && Number(head.headers.get('content-length')) === entry.bytes && (await head.arrayBuffer()).byteLength === 0, `HEAD mismatch: ${entry.path}`);
    if (entry.mime.startsWith('audio/')) {
      const start = Math.floor(entry.bytes / 2);
      const ranged = await fetch(url, { headers: { Range: `bytes=${start}-${start + 1023}` } });
      invariant(ranged.status === 206 && ranged.headers.get('content-range') === `bytes ${start}-${start + 1023}/${entry.bytes}`, `Seek range failed: ${entry.path}`);
      invariant(Buffer.from(await ranged.arrayBuffer()).equals(bytes.subarray(start, start + 1024)), `Seek bytes mismatch: ${entry.path}`);
    }
    checks.push({ path: entry.path, status: 200, bytes: entry.bytes, sha256: entry.sha256, mime: entry.mime, range: entry.mime.startsWith('audio/') ? 206 : null });
  }
  invariant((await fetch(`${root}demo/audio/does-not-exist.mp3`)).status === 404, 'Missing media must return 404');
  await mkdir('test-results', { recursive: true });
  await writeFile('test-results/pages-smoke.json', `${JSON.stringify({ profile: profile.dataSource, base: profile.base, checks }, null, 2)}\n`);
  console.log(`HTTP smoke passed: ${checks.length} files, GET/HEAD/hash/MIME and MP3 seek ranges.`);
} catch (error) { console.error(error.message); process.exitCode = 1; }
finally { if (server) await new Promise(resolve => server.close(resolve)); }
