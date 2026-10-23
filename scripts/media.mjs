import { spawnSync } from 'node:child_process';
import { readFile, stat } from 'node:fs/promises';
import { readManifest, selectAudio, verifyMedia, verifyPointerDeclaration, invariant } from './media-lib.mjs';

const command = process.argv[2] || 'verify';
const ids = process.env.TRACK_IDS || 'all';
try {
  if (command === 'pull') {
    const { manifest } = await readManifest();
    const selected = selectAudio(manifest, ids);
    for (const entry of selected) {
      const filename = `demo/${entry.path}`;
      try {
        const info = await stat(filename);
        invariant(info.size <= Math.max(1024, entry.bytes), `Unexpected local media size: ${entry.path}`);
        // Validate pointer declarations before any network fetch; a wrong OID/size fails early.
        if (info.size <= 1024) verifyPointerDeclaration(await readFile(filename), entry);
      } catch (error) { if (error.code !== 'ENOENT') throw error; }
    }
    const includes = selected.map(entry => `demo/${entry.path}`).join(',');
    if (!includes) throw new Error('No audio files selected');
    // Explicit includes/excludes override developer LFS preferences; no other binary set is fetched.
    const result = spawnSync('git', ['lfs', 'pull', '--include', includes, '--exclude', '', process.env.MEDIA_REMOTE || 'origin'], { stdio: 'inherit', env: { ...process.env, GIT_LFS_SKIP_SMUDGE: '1' } });
    if (result.error) throw result.error;
    if (result.status !== 0) throw new Error(`git lfs pull failed (${result.status}); check Git/LFS authentication and quotas`);
  } else if (command !== 'verify') throw new Error(`Unknown media operation: ${command}`);
  const result = await verifyMedia({ ids, checkSeed: process.env.MEDIA_SKIP_SEED !== '1' });
  console.log(`Verified ${result.selected.length} MP3 files, ${result.manifest.images.length} images; catalog ${result.bytes} bytes.`);
} catch (error) { console.error(error.message); process.exitCode = 1; }
