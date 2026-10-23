import { createServer } from 'node:http';
import { cp, mkdir, writeFile, rm, copyFile, stat, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { verifyMedia, invariant, readJson, walk } from './media-lib.mjs';
import { creditsHtml, normalizeBase, staticMiddleware } from './static-server.mjs';

export async function packagePages({ root = process.cwd(), probe = false, base } = {}) {
  const output = path.resolve(root, probe ? '.pages-probe' : '.pages');
  invariant(output.startsWith(`${path.resolve(root)}${path.sep}`), 'Output must stay inside the project');
  const { manifest, licenses, selected } = await verifyMedia({ root, ids: probe ? '1' : 'all', checkSeed: !probe });
  let profile;
  if (probe) profile = { dataSource: 'probe', base: normalizeBase(base || '/Sonar-front-end/'), modules: [] };
  else {
    profile = await readJson(path.join(root, 'dist/build-profile.json'));
    invariant(profile.dataSource === 'mock' && Array.isArray(profile.modules), 'Run task build:demo before pages:package');
    normalizeBase(profile.base);
    invariant((await stat(path.join(root, 'dist/index.html'))).isFile(), 'Missing compiled demo index');
    for (const filename of await walk(path.join(root, 'dist'))) {
      invariant(!/\.(mp3|wav|ogg|flac|m4a)$/i.test(filename), 'build:demo must not copy binary media');
      if (/\.(js|css|html)$/.test(filename)) invariant(!/data:audio\//i.test(await readFile(filename, 'utf8')), 'Audio data URLs are forbidden in demo code');
    }
  }
  await rm(output, { recursive: true, force: true });
  await mkdir(output, { recursive: true });
  if (!probe) await cp(path.join(root, 'dist'), output, { recursive: true, dereference: false });
  else {
    await writeFile(path.join(output, 'index.html'), `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Sonar MP3 delivery probe</title><style>body{font:18px/1.6 system-ui;max-width:700px;margin:60px auto;padding:24px;background:#10111b;color:#eee}audio{width:100%}a{color:#aebcff}</style><h1>MP3 delivery probe</h1><p>Carefree — Kevin MacLeod. Play, seek, then reload this page to verify static delivery.</p><audio controls preload="metadata" src="${profile.base}demo/${selected[0].path}"></audio><p><a href="${profile.base}media-credits.html">Music attribution and license</a></p></html>`);
  }
  const images = probe ? manifest.images.filter(entry => entry.id === selected[0].coverId) : manifest.images;
  const packaged = { ...manifest, audio: selected, images };
  const paths = new Set([...selected, ...images].map(entry => entry.path));
  const packagedLicenses = { ...licenses, records: licenses.records.map(record => ({ ...record, files: record.files.filter(file => paths.has(file)) })).filter(record => record.files.length) };
  for (const entry of [...selected, ...images]) {
    const destination = path.join(output, 'demo', entry.path);
    await mkdir(path.dirname(destination), { recursive: true });
    await copyFile(path.join(root, 'demo', entry.path), destination);
  }
  await writeFile(path.join(output, 'demo/media-manifest.json'), `${JSON.stringify(packaged, null, 2)}\n`);
  await writeFile(path.join(output, 'demo/licenses.json'), `${JSON.stringify(packagedLicenses, null, 2)}\n`);
  // Generate credits from exactly the files being published, never from a CDN URL.
  await writeFile(path.join(output, 'media-credits.html'), await creditsHtml(output));
  await writeFile(path.join(output, 'build-profile.json'), `${JSON.stringify(profile, null, 2)}\n`);
  await writeFile(path.join(output, '.nojekyll'), '');
  const files = await walk(output);
  const bytes = (await Promise.all(files.map(filename => stat(filename)))).reduce((sum, info) => sum + info.size, 0);
  invariant(bytes < 256 * 1024 * 1024, 'Pages artifact exceeds the project 256 MiB budget');
  await verifyMedia({ root: output });
  console.log(`Packaged ${selected.length} MP3s into ${path.relative(root, output)} (${bytes} bytes), base ${profile.base}`);
  return { output, profile, bytes };
}

export async function previewPages({ root = process.cwd(), directory = '.pages', port = 4173, host = '127.0.0.1' } = {}) {
  invariant(['.pages', '.pages-probe'].includes(directory), 'PAGES_DIR must be .pages or .pages-probe');
  const output = path.join(root, directory);
  const profile = await readJson(path.join(output, 'build-profile.json'));
  await verifyMedia({ root: output });
  const server = createServer(staticMiddleware(output, { base: profile.base }));
  await new Promise((resolve, reject) => { server.once('error', reject); server.listen(port, host, resolve); });
  console.log(`Preview http://${host}:${server.address().port}${profile.base} (${directory})`);
  return server;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const operation = process.argv[2];
  try {
    if (operation === 'package' || operation === 'probe') await packagePages({ probe: operation === 'probe', base: process.env.PAGES_BASE });
    else if (operation === 'preview') await previewPages({ directory: process.env.PAGES_DIR || '.pages', port: Number(process.env.PORT || 4173), host: process.env.HOST || '127.0.0.1' });
    else throw new Error('Expected package, probe or preview');
  } catch (error) { console.error(error.message); process.exitCode = 1; }
}
