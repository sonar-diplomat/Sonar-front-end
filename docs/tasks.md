# Task commands

Task YAML is the public command graph. npm/Node scripts implement the operations once; GitHub Actions invokes the same tasks. Run commands from the repository root. Task executes portable Node scripts instead of depending on Windows `copy` or Unix `cp` commands in task definitions.

## Install pinned tools

Use Node 24.14.0 from `.nvmrc`, `npm ci`, Task **3.50.0**, and actionlint **1.7.12**. `task ci:tools` installs actionlint under ignored `.tools/`, verifies the archive SHA-256 before extraction and checks its version. It supports Windows/Linux x64. For another platform, install the same official version and set `ACTIONLINT_BIN` to its executable.

Task can be installed using `winget install --id Task.Task --version 3.50.0 --exact` if that version is available, or from the [official release](https://github.com/go-task/task/releases/tag/v3.50.0). The reproducible archive method is:

```powershell
New-Item -ItemType Directory .tools/task -Force
Invoke-WebRequest https://github.com/go-task/task/releases/download/v3.50.0/task_windows_amd64.zip -OutFile .tools/task.zip
$taskArchiveHash = (Get-FileHash .tools/task.zip -Algorithm SHA256).Hash.ToLowerInvariant()
if ($taskArchiveHash -ne '82c20fbd19ac62073b8ecf89e026fbd209f702a2922106e4ff2ed6934d193038') { throw 'Task checksum mismatch' }
Expand-Archive .tools/task.zip .tools/task -Force
$env:PATH = "$PWD\.tools\task;$env:PATH"
task --version
npm ci
task ci:tools
task --list
```

```sh
mkdir -p .tools/task
curl -fL https://github.com/go-task/task/releases/download/v3.50.0/task_linux_amd64.tar.gz -o .tools/task.tar.gz
printf '%s  %s\n' d449ba85ab85a0769989d78f8b9872938e4ba9347f7f4f925f73d98272a0a655 .tools/task.tar.gz | sha256sum --check
tar -xzf .tools/task.tar.gz -C .tools/task
export PATH="$PWD/.tools/task:$PATH"
task --version
npm ci
task ci:tools
task --list
```

The workflow setup action is pinned to a verified commit and receives the corresponding archive hash. Downloaded tools are never committed. See [Task installation](https://taskfile.dev/docs/installation) and [Task includes](https://taskfile.dev/docs/guide/).

## Commands and parameters

| Command | Purpose |
| --- | --- |
| `task --list` | Show descriptions of all available tasks |
| `task ci:tools` | Install checksum-verified actionlint |
| `task ci:yaml` | Parse YAML, resolve Task includes, run actionlint, enforce disabled legacy deploy |
| `task ci:data` | Validate seed/domain/manifest/license/credit relations without LFS |
| `task ci:check` | YAML, typecheck, lint, data and demo/profile/media tests |
| `task build:release` | API typecheck/build and release-content audit; no LFS pull |
| `task build:demo` | Mock typecheck/build with JSON, without copying music |
| `task media:pull TRACK_IDS=all MEDIA_REMOTE=origin` | Pull exactly selected manifest MP3s and verify |
| `task media:verify TRACK_IDS=all` | Verify local ordinary bytes and relationships |
| `task pages:package` | Package already-compiled demo plus verified media into `.pages/` |
| `task pages:preview PORT=4173` | HTTP preview using the package's base path |
| `task pages:smoke` | GET/HEAD/hash/MIME and seek-range checks of `.pages/` |
| `task pages:probe PAGES_BASE=/Sonar-front-end/` | Minimal first-MP3 package in `.pages-probe/` |
| `task pages:preview PAGES_DIR=.pages-probe PORT=4174` | Preview the probe on a separate port |
| `task pages:smoke PAGES_DIR=.pages-probe` | Probe HTTP checks |
| `task ci:docker` | Export actual context, build API builder/runtime, inspect files and Nginx HTTP |

`TRACK_IDS` accepts `all` or numeric IDs separated by commas. Invalid/unknown/duplicate IDs fail. `MEDIA_SKIP_SEED=1` is reserved for the independent first-file probe; it does not relax binary/license verification and cannot stand in for the normal checks. `PAGES_DIR` accepts `.pages` or `.pages-probe`. `PAGES_BASE` is an absolute pathname ending with `/`; compilation uses `VITE_BASE_PATH`, and full packaging reads the compiled audit instead of silently changing it.

`pages:package` depends on `media:verify` and checks the presence/type of `dist/build-profile.json`. It does not rebuild `dist/`. `build:release` and `build:demo` both write `dist/`; run them sequentially in one checkout, and rebuild the demo immediately before packaging. CI places them in separate jobs.

`ci:check` runs YAML, typecheck, lint and all test suites before the mandatory `ci:data` gate. A pending catalogue therefore does not mask automated tests; an incomplete seed/media relationship still makes the entire task fail and prevents dependent builds/publication.

## Add a task

1. Put the operation in one Node script or npm command, with nonzero exit codes on failed prerequisites. Keep platform-specific behavior inside that implementation.
2. Choose an existing included file: `tasks/build.yaml`, `media.yaml`, `pages.yaml` or `ci.yaml`. Add a concise `desc`, documented parameters and actionable `preconditions`.
3. Use `deps` only for independent prerequisite work. Task dependencies may run concurrently. Use ordered `cmds`/`task:` calls for operations that write the same output or require sequencing. A dependency in another namespace starts with `:`, for example `:media:verify`.
4. Invoke the npm/Node operation without copying its implementation into YAML or a workflow. Expose a parameter through Task `vars` and `env`, then validate it in the script.
5. Run `task --list`, `task ci:yaml` and the new command on Windows and Linux before documenting it as cross-platform verified. Wire the same task into CI when it is an acceptance gate.

Example:

```yaml
version: '3'
tasks:
  verify:
    desc: Verify local media bytes and metadata
    env:
      TRACK_IDS: '{{default "all" .TRACK_IDS}}'
    cmds: [npm run media:verify]
```

Do not put secrets, machine paths or duplicated multiline deployment scripts in Task YAML. Keep important sequencing/storage decisions beside the affected task.

## Validation notes

`ci:yaml` uses Task's own parser in addition to strict YAML parsing. Active/proposed Pages workflows receive unsuppressed actionlint checks. The two archived workflows keep their mandatory `if: false` guards and original checkout version; two narrowly scoped actionlint diagnostics are suppressed only for those files, after verifying they have no automatic trigger and cannot run. ShellCheck/pyflakes are optional and disabled consistently in the portable actionlint invocation.

Validated locally on 2026-10-23: Task/actionlint and media/profile tests on Windows and isolated Linux; first-file packaging and HTTP range smoke on both platforms; actual Linux Docker context, builder and final Nginx image checks. An earlier isolated Linux quality run passed typecheck/lint and the demo/player/profile/media suites; the six current media/importer tests were also rerun after the maintenance changes. The quality run's full `ci:check` stopped at the catalogue gate: seed track 2 has no imported manifest audio yet. This is not a green full-CI result. Published probe, twelve-file verification and GitHub-hosted workflow execution remain required; local parser/container results do not prove a deployment. The final Docker run includes the API cancellation/chunk changes and is recorded in [CI/CD](ci-cd.md).
