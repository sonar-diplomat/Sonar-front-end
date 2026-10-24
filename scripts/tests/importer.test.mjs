import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtemp, mkdir, writeFile, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { sha256 } from '../media-lib.mjs';

// Metadata-only MPEG fixtures exercise maintenance I/O, never catalogue playback.
// They live only in a temporary fixture project, never the repository catalogue or a published package.
function fixtureBytes(tag) {
  const bytes = Buffer.alloc(417 * 1300);
  for (let frame = 0; frame < 1300; frame++) {
    bytes.set([255, 251, 144, 196], frame * 417);
    bytes[frame * 417 + 40] = tag;
  }
  return bytes;
}

test('maintenance CLI resumes interrupted imports, preserves originals and records configured attribution', async () => {
  const prefix = path.join(tmpdir(), 'sonar-import-');
  const root = await mkdtemp(prefix);
  const importer = fileURLToPath(new URL('../acquire-demo-media.mjs', import.meta.url));
  const json = async relative => JSON.parse(await readFile(path.join(root, relative), 'utf8'));
  try {
    await mkdir(path.join(root, 'scripts'));
    for (const id of [1, 2, 3]) await writeFile(path.join(root, `fixture-${id}.mp3`), fixtureBytes(id));
    const sources = {
      schemaVersion: 1, author: 'Fixture Composer', license: 'CC0-1.0',
      licenseUrl: 'https://creativecommons.org/publicdomain/zero/1.0/',
      catalogUrl: 'https://example.invalid/test-catalogue', checkedOn: '2026-10-23',
      tracks: [1, 2].map(id => ({ id, title: `Fixture ${id}`, filename: `fixture-${id}.mp3`, isrc: `TEST0000000${id}`, coverId: 101 })),
    };
    const saveSources = () => writeFile(path.join(root, 'scripts/media-sources.json'), JSON.stringify(sources));
    await saveSources();
    const preload = path.join(root, 'mock-downloads.mjs');
    await writeFile(preload, `
import { appendFileSync, readFileSync } from 'node:fs';
import path from 'node:path';
globalThis.fetch = async url => {
  const id = /fixture-(\\d+)\\.mp3$/.exec(new URL(url).pathname)?.[1];
  if (!id) throw new Error('Unexpected fixture URL');
  appendFileSync(path.join(process.env.FIXTURE_ROOT, 'requests.txt'), id + '\\n');
  if (id === process.env.FIXTURE_FAIL_ID) return new Response('fixture interruption', { status: 503 });
  return new Response(readFileSync(path.join(process.env.FIXTURE_ROOT, 'fixture-' + id + '.mp3')));
};
`);
    const run = (args, failId = '') => spawnSync(process.execPath, ['--import', pathToFileURL(preload).href, importer, ...args], {
      cwd: root, encoding: 'utf8', env: { ...process.env, FIXTURE_ROOT: root, FIXTURE_FAIL_ID: failId },
    });
    const requests = async () => (await readFile(path.join(root, 'requests.txt'), 'utf8')).trim().split('\n');
    const interrupted = run(['--ids=1,2'], '2');
    assert.equal(interrupted.status, 1, interrupted.stdout + interrupted.stderr);
    assert.match(interrupted.stderr, /Download failed \(503\)/);
    assert.deepEqual((await json('demo/media-manifest.json')).audio.map(entry => entry.id), [1]);
    assert.equal(sha256(await readFile(path.join(root, 'demo/audio/1.mp3'))), sha256(fixtureBytes(1)));

    const resumed = run(['--ids=1,2']);
    assert.equal(resumed.status, 0, resumed.stdout + resumed.stderr);
    assert.deepEqual(await requests(), ['1', '2', '2']);
    assert.deepEqual((await json('demo/media-manifest.json')).audio.map(entry => entry.id), [1, 2]);

    const samePath = run(['--ids=1', '--replace=1']);
    assert.equal(samePath.status, 1);
    assert.match(samePath.stderr, /distinct new source path/);
    assert.deepEqual(await requests(), ['1', '2', '2']);

    Object.assign(sources.tracks[0], { title: 'Fixture replacement', filename: 'fixture-3.mp3', path: 'audio/1-v2.mp3', isrc: 'TEST00000003' });
    await saveSources();
    const replaced = run(['--ids=1', '--replace=1']);
    assert.equal(replaced.status, 0, replaced.stdout + replaced.stderr);
    assert.equal((await json('demo/media-manifest.json')).audio.find(entry => entry.id === 1).path, 'audio/1-v2.mp3');
    assert.equal(sha256(await readFile(path.join(root, 'demo/audio/1.mp3'))), sha256(fixtureBytes(1)));
    assert.equal(sha256(await readFile(path.join(root, 'demo/audio/1-v2.mp3'))), sha256(fixtureBytes(3)));

    sources.tracks[1].path = 'audio/occupied.mp3';
    await saveSources();
    await writeFile(path.join(root, 'demo/audio/occupied.mp3'), 'preserve this file');
    const collision = run(['--ids=2', '--replace=2']);
    assert.equal(collision.status, 1);
    assert.match(collision.stderr, /Refusing to overwrite/);
    assert.equal(await readFile(path.join(root, 'demo/audio/occupied.mp3'), 'utf8'), 'preserve this file');
    assert.equal((await json('demo/media-manifest.json')).audio.find(entry => entry.id === 2).path, 'audio/2.mp3');
    assert.deepEqual(await requests(), ['1', '2', '2', '3']);

    const license = (await json('demo/licenses.json')).records.find(record => record.id === 'audio-1');
    assert.match(license.attribution, /Fixture Composer/);
    assert.match(license.attribution, /CC0-1\.0/);
    assert.ok(license.attribution.includes(sources.licenseUrl));
  } finally {
    assert.ok(path.resolve(root).startsWith(path.resolve(prefix)), 'Cleanup must stay within the created fixture directory');
    await rm(root, { recursive: true, force: true });
  }
});
