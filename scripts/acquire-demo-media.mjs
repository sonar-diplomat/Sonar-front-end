// Explicit maintenance import from the author's site. CI obtains committed LFS objects instead.
import { mkdir, writeFile, copyFile, access } from 'node:fs/promises';
import { constants } from 'node:fs';
import path from 'node:path';
import { parseFile } from 'music-metadata';
import { createCovers } from './create-demo-covers.mjs';
import { readJson, sha256, invariant, verifyFile, safeMediaPath } from './media-lib.mjs';

const root = process.cwd();
const ids = (process.argv.find(arg => arg.startsWith('--ids=')) || '--ids=1').slice(6);
const replacements = new Set((process.argv.find(arg => arg.startsWith('--replace=')) || '--replace=').slice(10).split(',').filter(Boolean).map(Number));
try {
  const sources = await readJson(path.join(root, 'scripts/media-sources.json'));
  for (const key of ['author', 'license', 'licenseUrl', 'catalogUrl', 'checkedOn']) invariant(typeof sources[key] === 'string' && sources[key].trim(), `Missing source rights/provenance: ${key}`);
  const licenseLabel = sources.license === 'CC-BY-4.0' ? 'Creative Commons Attribution 4.0 International' : sources.license;
  const selectedIds = ids === 'all' ? sources.tracks.map(track => track.id) : ids.split(',').map(Number);
  invariant(selectedIds.length > 0 && selectedIds.every(id => sources.tracks.some(track => track.id === id)), 'Unknown source ID');
  invariant(new Set(selectedIds).size === selectedIds.length, 'Duplicate source IDs');
  let manifest = { schemaVersion: 1, audio: [], images: [] };
  let licenses = { schemaVersion: 1, records: [] };
  try { manifest = await readJson(path.join(root, 'demo/media-manifest.json')); licenses = await readJson(path.join(root, 'demo/licenses.json')); } catch (error) { if (error.code !== 'ENOENT') throw error; }
  invariant([...replacements].every(id => selectedIds.includes(id) && manifest.audio.some(track => track.id === id)), 'Replacement IDs must exist and be selected');
  await mkdir(path.join(root, 'demo/audio'), { recursive: true });
  await mkdir(path.join(root, '.media-cache'), { recursive: true });
  manifest.images = await createCovers(root);
  const coverLicense = {
    id: 'original-covers', title: 'Sonar procedural covers', author: 'Sonar demo contributors', license: 'CC0-1.0',
    licenseUrl: 'https://creativecommons.org/publicdomain/zero/1.0/',
    sourceUrl: 'https://github.com/sonar-diplomat/Sonar-front-end/blob/feat/mock-demo-github-pages/scripts/create-demo-covers.mjs',
    sourcePath: 'scripts/create-demo-covers.mjs',
    attribution: 'Original SVG geometry generated deterministically by the repository source; no third-party artwork. CC0 to the extent copyright or related rights exist.',
    changes: 'None; original generated SVG files.', files: manifest.images.map(entry => entry.path),
  };
  licenses.records = licenses.records.filter(record => record.id !== coverLicense.id); licenses.records.push(coverLicense);
  const persist = async () => {
    manifest.audio.sort((a, b) => a.id - b.id);
    licenses.records.sort((a, b) => a.id.localeCompare(b.id, 'en'));
    await writeFile(path.join(root, 'demo/licenses.json'), `${JSON.stringify(licenses, null, 2)}\n`);
    await writeFile(path.join(root, 'demo/media-manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);
  };
  await persist();
  for (const id of selectedIds) {
    const source = sources.tracks.find(track => track.id === id);
    const previous = manifest.audio.find(track => track.id === id);
    const relative = safeMediaPath(source.path || `audio/${id}.mp3`);
    invariant(relative.startsWith('audio/') && relative.endsWith('.mp3'), 'Source path must be an MP3 under audio/');
    const target = path.join(root, 'demo', relative);
    if (previous && !replacements.has(id)) { await verifyFile(path.join(root, 'demo', previous.path), previous); console.log(`Reusing verified ${previous.path}`); continue; }
    if (replacements.has(id)) invariant(previous && previous.path !== relative, 'Replacement requires an existing ID and a distinct new source path');
    try { await access(target); throw new Error(`Refusing to overwrite unregistered media: ${relative}`); } catch (error) { if (error.code !== 'ENOENT') throw error; }
    const downloadUrl = `https://incompetech.com/music/royalty-free/mp3-royaltyfree/${encodeURIComponent(source.filename)}`;
    const response = await fetch(downloadUrl);
    invariant(response.ok, `Download failed (${response.status}): ${source.title}`);
    const data = Buffer.from(await response.arrayBuffer());
    invariant(data.length > 100_000 && data.length < 25 * 1024 * 1024, `Unexpected MP3 size: ${source.title}`);
    const cache = path.join(root, `.media-cache/${id}.mp3`);
    await writeFile(cache, data);
    const metadata = await parseFile(cache, { duration: true, skipCovers: true });
    invariant(metadata.format.duration > 30 && metadata.format.codec?.includes('MPEG'), `Invalid MP3: ${source.title}`);
    const sourceUrl = `https://incompetech.com/music/royalty-free/index.html?isrc=${source.isrc}`;
    const entry = { id, audioFileId: id, path: relative, mime: 'audio/mpeg', bytes: data.length, sha256: sha256(data), durationSeconds: Number(metadata.format.duration.toFixed(6)), coverId: source.coverId, licenseId: `audio-${id}`, artistName: sources.author, sourceTitle: source.title, sourceUrl };
    await mkdir(path.dirname(target), { recursive: true });
    await copyFile(cache, target, constants.COPYFILE_EXCL);
    manifest.audio = manifest.audio.filter(track => track.id !== id);
    licenses.records = licenses.records.filter(record => record.id !== entry.licenseId);
    manifest.audio.push(entry);
    licenses.records.push({ id: entry.licenseId, title: source.title, author: sources.author, license: sources.license, licenseUrl: sources.licenseUrl, sourceUrl, downloadUrl, catalogUrl: sources.catalogUrl, isrc: source.isrc, checkedOn: sources.checkedOn, attribution: `${source.title} — ${sources.author} (incompetech.com). Licensed under ${licenseLabel}: ${sources.licenseUrl}`, changes: 'None; the original MP3 bytes are redistributed unchanged.', files: [relative] });
    console.log(`Imported ${relative}: ${entry.durationSeconds}s, ${entry.bytes} bytes, ${entry.sha256}`);
    // Register each verified file before the next download so an interrupted import resumes.
    await persist();
  }
  await persist();
} catch (error) { console.error(error.message); process.exitCode = 1; }
