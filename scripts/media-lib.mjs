import { createHash } from 'node:crypto';
import { readFile, lstat, realpath, readdir } from 'node:fs/promises';
import path from 'node:path';
import { parseFile } from 'music-metadata';
import { isPointer } from './static-server.mjs';

export const MAX_MEDIA_BYTES = 128 * 1024 * 1024;
export const sha256 = data => createHash('sha256').update(data).digest('hex');
export function invariant(condition, message) { if (!condition) throw new Error(message); }
export function safeMediaPath(value) {
  invariant(typeof value === 'string' && /^(audio|images)\/[A-Za-z0-9_./-]+$/.test(value), `Invalid media path: ${value}`);
  invariant(!value.split('/').some(part => !part || part === '.' || part === '..' || part.startsWith('.')), `Unsafe media path: ${value}`);
  return value;
}
export const readJson = async filename => JSON.parse(await readFile(filename, 'utf8'));

export function verifyPointerDeclaration(data, entry) {
  if (!isPointer(data)) return;
  const pointer = /^version https:\/\/git-lfs\.github\.com\/spec\/v1\noid sha256:([a-f0-9]{64})\nsize (\d+)\n?$/.exec(data.toString('utf8').replaceAll('\r\n', '\n'));
  invariant(pointer && pointer[1] === entry.sha256 && Number(pointer[2]) === entry.bytes, `LFS pointer disagrees with manifest: ${entry.path}`);
}

export async function readManifest(root = process.cwd()) {
  const manifest = await readJson(path.join(root, 'demo/media-manifest.json'));
  const licenses = await readJson(path.join(root, 'demo/licenses.json'));
  invariant(manifest.schemaVersion === 1 && Array.isArray(manifest.audio) && Array.isArray(manifest.images), 'Unsupported media manifest');
  invariant(licenses.schemaVersion === 1 && Array.isArray(licenses.records), 'Unsupported media licenses');
  const licenseMap = new Map();
  for (const record of licenses.records) {
    invariant(record.id && !licenseMap.has(record.id), `Duplicate/missing license ID: ${record.id}`);
    for (const key of ['title', 'author', 'license', 'licenseUrl', 'sourceUrl', 'attribution', 'changes']) invariant(typeof record[key] === 'string' && record[key].trim(), `License ${record.id} missing ${key}`);
    for (const key of ['licenseUrl', 'sourceUrl']) invariant(/^https:\/\/[^\s"<>]+$/.test(record[key]), `Invalid ${key}: ${record.id}`);
    invariant(Array.isArray(record.files) && record.files.length > 0, `License ${record.id} has no files`);
    licenseMap.set(record.id, record);
  }
  const paths = new Set(); let bytes = 0;
  for (const [kind, entries] of [['audio', manifest.audio], ['images', manifest.images]]) {
    const ids = new Set();
    for (const entry of entries) {
      invariant(Number.isSafeInteger(entry.id) && entry.id > 0 && !ids.has(entry.id), `Duplicate/invalid ${kind} ID: ${entry.id}`); ids.add(entry.id);
      safeMediaPath(entry.path);
      invariant(entry.path.startsWith(`${kind}/`) && !paths.has(entry.path), `Duplicate or wrong media path: ${entry.path}`); paths.add(entry.path);
      invariant(Number.isSafeInteger(entry.bytes) && entry.bytes > 0 && /^[a-f0-9]{64}$/.test(entry.sha256), `Invalid size/hash: ${entry.path}`);
      const record = licenseMap.get(entry.licenseId);
      invariant(record && record.files.includes(entry.path), `Missing license relation: ${entry.path}`);
      if (kind === 'audio') {
        invariant(entry.mime === 'audio/mpeg' && entry.path.endsWith('.mp3'), `Unsupported audio MIME: ${entry.path}`);
        invariant(Number.isFinite(entry.durationSeconds) && entry.durationSeconds > 0, `Invalid duration: ${entry.path}`);
        invariant(entry.audioFileId === entry.id && manifest.images.some(image => image.id === entry.coverId), `Broken audio/cover relation: ${entry.id}`);
        invariant(entry.artistName && entry.sourceTitle && entry.sourceUrl === record.sourceUrl, `Missing source credits: ${entry.id}`);
      } else invariant(({ '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp' })[path.extname(entry.path)] === entry.mime, `Invalid image MIME: ${entry.path}`);
      bytes += entry.bytes;
    }
  }
  invariant(bytes <= MAX_MEDIA_BYTES, `Media budget exceeded: ${bytes} > ${MAX_MEDIA_BYTES}`);
  for (const record of licenses.records) for (const file of record.files) invariant(paths.has(file), `License ${record.id} references absent media ${file}`);
  return { manifest, licenses, bytes };
}

export function selectAudio(manifest, ids = 'all') {
  if (ids === 'all') return manifest.audio;
  const requested = String(ids).split(',').map(id => Number(id.trim()));
  invariant(requested.length > 0 && requested.every(id => Number.isSafeInteger(id) && id > 0), 'TRACK_IDS must be all or comma-separated numeric IDs');
  invariant(new Set(requested).size === requested.length, 'TRACK_IDS contains duplicates');
  const entries = requested.map(id => manifest.audio.find(entry => entry.id === id));
  invariant(entries.every(Boolean), `Unknown audio ID in ${ids}`);
  return entries;
}

export function verifySeedMedia(seed, manifest, selectedIds) {
  const images = new Set(manifest.images.map(entry => entry.id));
  for (const track of seed.state.tracks) {
    if (selectedIds && !selectedIds.has(track.id)) continue;
    const audio = manifest.audio.find(entry => entry.id === track.id);
    invariant(audio, `Missing manifest audio for seed track ${track.id}`);
    for (const key of ['lowQualityAudioFileId', 'mediumQualityAudioFileId', 'highQualityAudioFileId']) if (track[key] != null) invariant(track[key] === audio.audioFileId, `Seed audio relation ${key}: ${track.id}`);
    invariant(track.coverId === audio.coverId && track.title === audio.sourceTitle, `Seed title/cover mismatch: ${track.id}`);
    const duration = String(track.duration).split(':').reduce((total, number) => total * 60 + Number(number), 0);
    invariant(Math.abs(duration - audio.durationSeconds) < 1, `Seed duration mismatch: ${track.id}`);
    invariant(track.demoCredits?.artist === audio.artistName && track.demoCredits?.sourceUrl === audio.sourceUrl, `Seed attribution mismatch: ${track.id}`);
    invariant(track.demoCredits?.licenseUrl === 'https://creativecommons.org/licenses/by/4.0/', `Seed license mismatch: ${track.id}`);
  }
  const inspect = value => {
    if (!value || typeof value !== 'object') return;
    for (const [key, child] of Object.entries(value)) {
      if (['coverId', 'avatarImageId'].includes(key) && child != null) invariant(images.has(child), `Seed image relation ${key}=${child}`);
      if (typeof child === 'object') inspect(child);
    }
  };
  inspect(seed.state);
}

export async function verifyFile(filename, entry) {
  const stat = await lstat(filename);
  invariant(stat.isFile() && !stat.isSymbolicLink(), `Media must be an ordinary file: ${entry.path}`);
  const data = await readFile(filename);
  invariant(!isPointer(data), `LFS pointer instead of bytes: ${entry.path}; run task media:pull`);
  invariant(data.length === entry.bytes, `Size mismatch: ${entry.path}`);
  invariant(sha256(data) === entry.sha256, `SHA-256 mismatch: ${entry.path}`);
  if (entry.mime === 'audio/mpeg') {
    const parsed = await parseFile(filename, { duration: true, skipCovers: true });
    invariant(parsed.format.codec?.includes('MPEG') && parsed.format.sampleRate > 0 && parsed.format.numberOfChannels > 0, `Not decodable MPEG audio: ${entry.path}`);
    invariant(Math.abs(parsed.format.duration - entry.durationSeconds) <= 0.1, `Duration mismatch: ${entry.path}`);
  } else if (entry.mime === 'image/svg+xml') {
    const svg = data.toString('utf8');
    invariant(/<svg\b/.test(svg) && !/<script\b|<!ENTITY|<!DOCTYPE|\bon\w+\s*=|(?:href|src)\s*=/i.test(svg), `Unsafe/invalid SVG: ${entry.path}`);
  } else {
    const isPng = data.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10]));
    const isJpeg = data[0] === 255 && data[1] === 216 && data[2] === 255;
    const isWebp = data.subarray(0,4).toString() === 'RIFF' && data.subarray(8,12).toString() === 'WEBP';
    invariant(({ 'image/png': isPng, 'image/jpeg': isJpeg, 'image/webp': isWebp })[entry.mime], `Image signature mismatch: ${entry.path}`);
  }
}

export async function verifyMedia({ root = process.cwd(), ids = 'all', mediaRoot = path.join(root, 'demo'), checkSeed = true } = {}) {
  const { manifest, licenses, bytes } = await readManifest(root);
  const selected = selectAudio(manifest, ids);
  const hashes = new Set();
  for (const entry of [...selected, ...manifest.images]) {
    const filename = path.join(mediaRoot, safeMediaPath(entry.path));
    invariant((await realpath(filename)).startsWith(`${await realpath(mediaRoot)}${path.sep}`), `Media escapes root: ${entry.path}`);
    await verifyFile(filename, entry);
    if (entry.mime.startsWith('audio/')) { invariant(!hashes.has(entry.sha256), `Duplicate audio bytes: ${entry.id}`); hashes.add(entry.sha256); }
  }
  try {
    if (checkSeed) {
      const seed = await readJson(path.join(root, 'demo/data/seed.json'));
      verifySeedMedia(seed, manifest, ids === 'all' ? undefined : new Set(selected.map(entry => entry.id)));
    }
  } catch (error) { if (error.code !== 'ENOENT') throw error; }
  return { manifest, licenses, bytes, selected };
}

export async function walk(root) {
  const result = [];
  for (const entry of await readdir(root, { withFileTypes: true })) {
    const filename = path.join(root, entry.name);
    invariant(!entry.isSymbolicLink(), `Symlinks are forbidden in artifacts: ${entry.name}`);
    if (entry.isDirectory()) result.push(...await walk(filename)); else result.push(filename);
  }
  return result;
}
