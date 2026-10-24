import { spawnSync } from 'node:child_process';
import { mkdir, writeFile, readFile } from 'node:fs/promises';
import path from 'node:path';
import { walk, invariant } from './media-lib.mjs';
import { assertRelease } from './assert-release.mjs';

const root = process.cwd();
const cache = path.resolve(root, '.cache', `docker-${process.pid}`);
const builder = `sonar-frontend-audit-builder:${process.pid}`;
const runtime = `sonar-frontend-audit-runtime:${process.pid}`;
const containers = []; const images = [];
const report = { checkedAt: new Date().toISOString(), status: 'running', phase: 'context', engine: null, context: null, builder: null, runtime: null };
function docker(args, capture = false) {
  const result = spawnSync('docker', args, { cwd: root, encoding: 'utf8', stdio: capture ? 'pipe' : 'inherit', env: { ...process.env, GIT_LFS_SKIP_SMUDGE: '1' }, maxBuffer: 16 * 1024 * 1024 });
  if (result.error) throw result.error;
  invariant(result.status === 0, `docker ${args[0]} failed (${result.status}): ${capture ? result.stderr : 'see Docker output'}`);
  return result.stdout?.trim();
}
try {
  invariant(cache.startsWith(`${path.resolve(root)}${path.sep}.cache${path.sep}`), 'Audit output must stay in project cache');
  await mkdir(cache, { recursive: true });
  report.engine = docker(['version', '--format', '{{.Server.Version}}'], true);
  docker(['build', '--target', 'context-audit', '--output', `type=local,dest=${path.join(cache, 'context')}`, '--progress', 'plain', '.']);
  const context = path.join(cache, 'context', 'context');
  const files = (await walk(context)).map(filename => path.relative(context, filename).replaceAll('\\', '/'));
  for (const filename of files) {
    invariant(!/^(demo|\.pages|\.pages-probe|docs|Documentation|tasks|tests|node_modules|\.github|\.git|\.tools|\.cache|\.media-cache)(\/|$)/.test(filename), `Forbidden context path: ${filename}`);
    invariant(!/\.(mp3|wav|ogg|flac|m4a)$/i.test(filename) && !/^\.env(?!\.example$)/.test(filename), `Media/environment in context: ${filename}`);
    invariant(!/\.(test|spec)\.tsx?$/.test(filename), `Demo-fixture test in server context: ${filename}`);
  }
  for (const required of ['package.json','package-lock.json','vite.config.ts','tsconfig.app.json','tsconfig.node.json','eslint.config.ts','capacitor.config.ts','src/main.tsx','nginx.conf','scripts/demo-media-plugin.mjs','scripts/demo-media-plugin.d.mts','scripts/static-server.mjs','scripts/assert-release.mjs']) invariant(files.includes(required), `Required build input excluded: ${required}`);
  console.log(`Actual Docker context verified: ${files.length} files, no demo/media/docs/tasks or local env.`);
  report.context = { files: files.length, demo: false, audio: false, requiredInputsPresent: true };
  if (!process.argv.includes('--context-only')) {
    report.phase = 'builder';
    docker(['build', '--target', 'builder', '--tag', builder, '--progress', 'plain', '.']); images.push(builder);
    docker(['run', '--rm', '--network', 'none', '--entrypoint', 'node', builder, 'scripts/assert-release.mjs']);
    docker(['run', '--rm', '--network', 'none', '--entrypoint', 'sh', builder, '-c', 'test ! -e /app/demo && test ! -e /app/.pages && test ! -e /app/docs && test ! -e /app/.env.demo']);
    docker(['run', '--rm', '--network', 'none', '--entrypoint', 'sh', builder, '-c', 'if command -v git-lfs; then exit 1; fi']);
    report.builder = { apiBuildPassedWithoutDemo: true, lfsAvailable: false };
    report.phase = 'runtime';
    docker(['build', '--target', 'runtime', '--tag', runtime, '--progress', 'plain', '.']); images.push(runtime);
    const container = docker(['create', runtime], true); containers.push(container);
    const output = path.join(cache, 'runtime'); await mkdir(output, { recursive: true });
    docker(['cp', `${container}:/usr/share/nginx/html/.`, output]);
    await assertRelease(output);
    const profile = JSON.parse(await readFile(path.join(output, 'build-profile.json'), 'utf8'));
    const running = docker(['run', '-d', '--rm', '-p', '127.0.0.1::80', runtime], true); containers.push(running);
    docker(['exec', running, 'nginx', '-t']);
    const port = docker(['port', running, '80/tcp'], true).split(':').at(-1);
    let response;
    for (let attempt = 0; attempt < 20; attempt++) {
      try { response = await fetch(`http://127.0.0.1:${port}/build-profile.json`); if (response.ok) break; } catch { /* Nginx may still be starting. */ }
      await new Promise(resolve => setTimeout(resolve, 250));
    }
    invariant(response?.ok && (await response.json()).dataSource === 'api', 'Nginx HTTP profile smoke failed');
    invariant((await fetch(`http://127.0.0.1:${port}/`)).status === 200, 'Nginx index smoke failed');
    report.runtime = { nginxConfig: 'pass', http: 200, dataSource: profile.dataSource, renderedModules: profile.modules.length, demo: false, audio: false };
  }
  report.status = process.argv.includes('--context-only') ? 'context-only' : 'passed';
  console.log('Docker verification completed; report test-results/docker-audit.json');
} catch (error) { report.status = 'failed'; console.error(error.message); process.exitCode = 1; }
finally {
  await mkdir('test-results', { recursive: true });
  await writeFile('test-results/docker-audit.json', `${JSON.stringify(report, null, 2)}\n`);
  for (const id of containers) if (/^[a-f0-9]{64}$/.test(id)) spawnSync('docker', ['rm', '-f', id], { stdio: 'ignore' });
  for (const image of images) spawnSync('docker', ['image', 'rm', image], { stdio: 'ignore' });
}
