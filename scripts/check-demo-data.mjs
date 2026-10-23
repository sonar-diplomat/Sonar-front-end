import path from 'node:path';
import { validateSeed } from '../src/shared/demo/database.ts';
import { readJson, readManifest, verifySeedMedia } from './media-lib.mjs';

try {
  const seed = await readJson(path.resolve('demo/data/seed.json'));
  validateSeed(seed);
  const { manifest } = await readManifest();
  verifySeedMedia(seed, manifest);
  console.log(`Seed validated: ${seed.state.tracks.length} tracks; all media, license and credit relations resolve.`);
} catch (error) { console.error(error.message); process.exitCode = 1; }
