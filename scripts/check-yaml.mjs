import { spawnSync } from 'node:child_process';
import { access, readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { parseDocument } from 'yaml';

const run = (command, args) => {
  const result = spawnSync(command, args, { encoding: 'utf8' });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(result.stdout + result.stderr);
  return result.stdout;
};
try {
  const workflows = (await readdir('.github/workflows')).filter(name => /\.ya?ml(?:\.disabled)?$/.test(name)).map(name => `.github/workflows/${name}`);
  const tasks = (await readdir('tasks')).filter(name => /\.ya?ml$/.test(name)).map(name => `tasks/${name}`);
  for (const filename of ['Taskfile.yaml', ...tasks, ...workflows, '.github/actions/setup/action.yml']) {
    const document = parseDocument(await readFile(filename, 'utf8'), { uniqueKeys: true, strict: true });
    if (document.errors.length) throw new Error(`${filename}: ${document.errors.map(error => error.message).join('; ')}`);
    if (/\/(frontend|deploy-aws-ec2)\.yml$/.test(filename)) {
      const workflow = document.toJS();
      if (Object.keys(workflow.on).join(',') !== 'workflow_dispatch' || workflow.jobs.deploy.if !== '${{ false }}') throw new Error(`Legacy deploy must stay manual-only and disabled: ${filename}`);
    }
  }
  const version = run('task', ['--version']);
  if (!version.includes('3.50.0')) throw new Error('Use the documented Task 3.50.0');
  // Task itself resolves includes and validates its schema instead of a generic YAML-only check.
  run('task', ['--list-all']);
  let actionlint = process.env.ACTIONLINT_BIN;
  if (!actionlint) {
    const bundled = path.resolve('.tools', process.platform === 'win32' ? 'actionlint.exe' : 'actionlint');
    try { await access(bundled); actionlint = bundled; } catch { actionlint = 'actionlint'; }
  }
  if (!run(actionlint, ['-version']).startsWith('1.7.12')) throw new Error('Use actionlint 1.7.12; run task ci:tools');
  // ShellCheck is an optional OS-specific tool; actionlint still checks expressions/jobs/actions.
  const legacy = workflows.filter(filename => /\/(frontend|deploy-aws-ec2)\.yml$/.test(filename));
  const active = workflows.filter(filename => !legacy.includes(filename));
  run(actionlint, ['-shellcheck=', '-pyflakes=', ...active]);
  // Archived workflows retain their original checkout action and mandatory false guard.
  // Suppress only those two known diagnostics, and only for files checked disabled above.
  for (const filename of legacy) run(actionlint, ['-shellcheck=', '-pyflakes=', '-ignore', 'constant expression "false" in condition|the runner of "actions/checkout@v3" action is too old', filename]);
  console.log(`Task parser and actionlint verified ${tasks.length + 1} Task files and ${workflows.length} workflows.`);
} catch (error) { console.error(error.message); process.exitCode = 1; }
