import { readdir, readFile, lstat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export async function assertRelease(root = path.resolve('dist')) {
  const profile = JSON.parse(await readFile(path.join(root, 'build-profile.json'), 'utf8'));
  if (profile.dataSource !== 'api' || !Array.isArray(profile.modules)) throw new Error('Release requires an audited API build');
  const unexpected = profile.modules.filter(id => /(^|\/)(demo\/|shared\/demo\/)/.test(id) || /\/(DemoOutboxNotice|DemoPlayerSync)\.tsx?$/.test(id));
  if (unexpected.length) throw new Error(`Rendered demo modules in API build: ${unexpected.join(', ')}`);
  let count = 0;
  async function inspect(directory) {
    for (const name of await readdir(directory)) {
      const filename = path.join(directory, name); const info = await lstat(filename);
      if (info.isSymbolicLink()) throw new Error('Symlink in release output');
      if (info.isDirectory()) { if (name === 'demo') throw new Error('Demo directory in release'); await inspect(filename); }
      else {
        count++;
        if (/\.(mp3|wav|ogg|flac|m4a)$/i.test(name) || /media-manifest|licenses\.json|media-credits/.test(name)) throw new Error(`Demo/media file in release: ${name}`);
        if (/\.(js|css|html)$/.test(name)) {
          const contents = await readFile(filename, 'utf8');
          if (/data:audio\/|sonar-demo:|sonar-demo-state|demo\/audio\//.test(contents)) throw new Error(`Demo/audio content in release: ${name}`);
        }
      }
    }
  }
  await inspect(root);
  console.log(`API release verified: ${profile.modules.length} rendered modules, ${count} output files; no demo media/runtime.`);
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { await assertRelease(path.resolve(process.argv[2] || 'dist')); } catch (error) { console.error(error.message); process.exitCode = 1; }
}
