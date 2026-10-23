import { spawnSync } from 'node:child_process';
import { readManifest, selectAudio, verifyMedia } from './media-lib.mjs';

const command = process.argv[2] || 'verify';
const ids = process.env.TRACK_IDS || 'all';
try {
  if (command === 'pull') {
    const { manifest } = await readManifest();
    const includes = selectAudio(manifest, ids).map(entry => `demo/${entry.path}`).join(',');
    if (!includes) throw new Error('No audio files selected');
    // Explicit includes/excludes override developer LFS preferences; no other binary set is fetched.
    const result = spawnSync('git', ['lfs', 'pull', '--include', includes, '--exclude', '', process.env.MEDIA_REMOTE || 'origin'], { stdio: 'inherit', env: { ...process.env, GIT_LFS_SKIP_SMUDGE: '1' } });
    if (result.error) throw result.error;
    if (result.status !== 0) throw new Error(`git lfs pull failed (${result.status}); check Git/LFS authentication and quotas`);
  } else if (command !== 'verify') throw new Error(`Unknown media operation: ${command}`);
  const result = await verifyMedia({ ids, checkSeed: process.env.MEDIA_SKIP_SEED !== '1' });
  console.log(`Verified ${result.selected.length} MP3 files, ${result.manifest.images.length} images; catalog ${result.bytes} bytes.`);
} catch (error) { console.error(error.message); process.exitCode = 1; }
