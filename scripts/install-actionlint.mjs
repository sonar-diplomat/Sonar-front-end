import { mkdir, writeFile, chmod, access } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { sha256, invariant } from './media-lib.mjs';

const version = '1.7.12';
const archives = {
  'win32-x64': { name: `actionlint_${version}_windows_amd64.zip`, hash: '6e7241b51e6817ea6a047693d8e6fed13b31819c9a0dd6c5a726e1592d22f6e9' },
  'linux-x64': { name: `actionlint_${version}_linux_amd64.tar.gz`, hash: '8aca8db96f1b94770f1b0d72b6dddcb1ebb8123cb3712530b08cc387b349a3d8' },
};
try {
  const binary = path.resolve('.tools', process.platform === 'win32' ? 'actionlint.exe' : 'actionlint');
  try { await access(binary); const check = spawnSync(binary, ['-version'], { encoding: 'utf8' }); if (check.status === 0 && check.stdout.startsWith(version)) { console.log(`actionlint ${version} already installed`); process.exit(0); } } catch { /* Download the pinned binary below. */ }
  const archive = archives[`${process.platform}-${process.arch}`];
  invariant(archive, 'Automatic actionlint install supports Windows/Linux x64; use ACTIONLINT_BIN for other systems');
  const response = await fetch(`https://github.com/rhysd/actionlint/releases/download/v${version}/${archive.name}`);
  invariant(response.ok, `actionlint download HTTP ${response.status}`);
  const data = Buffer.from(await response.arrayBuffer());
  invariant(sha256(data) === archive.hash, 'actionlint archive SHA-256 mismatch');
  await mkdir('.tools', { recursive: true });
  const filename = path.resolve('.tools', archive.name);
  await writeFile(filename, data);
  const extracted = spawnSync('tar', ['-xf', filename, '-C', path.resolve('.tools')], { stdio: 'inherit' });
  invariant(extracted.status === 0, 'Could not extract actionlint (tar is required)');
  if (process.platform !== 'win32') await chmod(binary, 0o755);
  const check = spawnSync(binary, ['-version'], { stdio: 'inherit' });
  invariant(check.status === 0, 'Installed actionlint could not execute');
} catch (error) { console.error(error.message); process.exitCode = 1; }
