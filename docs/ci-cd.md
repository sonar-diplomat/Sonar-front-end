# CI and Pages publication

The frontend has separate API and demo builds. Task commands are the shared local/CI interface; [tasks.md](tasks.md) lists tools and parameters, and [media-storage.md](media-storage.md) describes LFS, licenses and binary verification.

## Workflow graph

`.github/workflows/frontend-ci.yml` supports feature/default-branch pushes, pull requests and `workflow_call`. The Pages workflow calls it for `dev` and full manual publication. Pull requests never publish a site.

| Job | Work and outputs |
| --- | --- |
| `quality` | Windows/Linux matrix; locked dependencies, verified Task, actionlint, `task ci:check` |
| `release` | After quality: `task build:release`, actual `task ci:docker`, `release-audit` report |
| `demo` | After quality: `task build:demo`; uploads compile-only `demo-dist` |
| `media` | After demo: the only targeted LFS pull/verify; uploads ordinary bytes as `demo-media` |
| `package` | Downloads those two artifacts, runs `pages:package` and HTTP smoke; uploads `demo-pages` and `pages-http-audit` |

All checkouts set `lfs: false` and skip smudging. The server job has no LFS pull. Only the media job obtains music; dependent jobs receive those bytes as an artifact. API and demo compilation run in separate jobs, so they cannot overwrite one shared `dist/`.

`.github/actions/setup/action.yml` pins Node through `.nvmrc`, installs Task 3.50.0 from a fixed setup-action commit with platform-specific SHA-256, and installs locked npm dependencies. `ci:tools` separately verifies the actionlint 1.7.12 archive. `ci:check` performs YAML, typecheck, lint, seed/media metadata and demo/profile/media tests. A failure is not waived because the Vite bundler can emit files.

`.github/workflows/pages.yml` is the intended executable path. A `.disabled` suffix means the proposal is not registered and cannot run; it must be accepted and activated through the repository's normal review process before expecting any trigger to work. The deployment design is:

- `push` to `dev`: run reusable full CI; package for Pages only after all jobs succeed and the verified-probe variable is set.
- `workflow_dispatch`, `mode=probe`: YAML/media tests, targeted track 1 download, standalone package/HTTP checks, then one-MP3 publication. This experiment does not certify the full application or seed.
- `workflow_dispatch`, `mode=full`: reusable full CI, then package/deploy under the same probe gate.
- Only `deploy` has `pages: write` and `id-token: write`; it needs a successful probe/package, uses environment `github-pages` and exposes the deployment URL.
- Workflow concurrency `github-pages` with `cancel-in-progress: false` serializes publication. Do not start another deployment outside that sequence.

The probe and full package contain extracted ordinary MP3 files. They never rely on LFS/raw URLs or publish pointer files. The transport remains conditional on real published delivery proof because GitHub explicitly documents the [LFS/Pages limitation](https://docs.github.com/en/repositories/working-with-files/managing-large-files/about-git-large-file-storage).

## Maintainer setup and first publication

1. Confirm repository/plan support, available LFS storage/download quota and Pages limits. Do not enable paid packages or broaden repository access as a workaround.
2. In Settings → Pages, select **Source: GitHub Actions**. Create/check the `github-pages` environment and permit only the intended deployment refs under its protection rules. Confirm who can approve required deployments.
3. Ensure the workflow is registered in the default branch. The default branch is `master`; `workflow_dispatch` availability depends on this, even when the run targets another reviewed branch. A minimal registration change must preserve normal PR/protection checks. The selected execution ref must contain the actual workflow, scripts, Taskfiles, lockfile and committed LFS pointer/object.
4. Accept/activate the prepared workflow. Use the Actions UI → GitHub Pages demo → Run workflow, select the reviewed ref and `mode=probe`. With an authenticated CLI, the equivalent is `gh workflow run pages.yml --ref REVIEWED_REF -f mode=probe`. Do not pass a ref that lacks the required files.
5. Inspect every job, artifact and environment approval. Open the URL returned by `deploy-pages`. Request the actual MP3 and check HTTP status/MIME, exact length/SHA-256, no pointer text, seek/range behavior and audible browser playback after user interaction. Record the deployment run/commit, URL and observations in the verification record.
6. Only after this succeeds, import/register the remaining distinct tracks, validate their metadata/seed/credits, review LFS quota and set repository variable **`PAGES_MEDIA_PROBE_VERIFIED`** to the string **`true`**. This variable gates full Pages packaging; it is not a substitute for verification.
7. Run full checks/build/package/browser acceptance, then publish from `dev` or a permitted manual ref. Recheck the actual application URL, deep hash routes, reload, playback/seek, queue and persisted state.

Pages Source has been observed as GitHub Actions. Environment/ref rules, default-branch registration and actual external MP3 proof remain independent checks. An enabled Source or successful local preview does not prove a published deployment.

The observed `github-pages` environment currently permits only `master`. This blocks the prepared demo branch and `dev`, independently of workflow registration. A Maintainer must explicitly accept the intended probe/deployment refs in that environment before the corresponding deployment can proceed. The default-branch registration [PR #122](https://github.com/sonar-diplomat/Sonar-front-end/pull/122) is also pending normal review. Keep dependent publication stopped; do not change protection rules, deploy from the registration stub or use a different ref to bypass the restriction. LFS quota/remote object availability still need confirmation before catalogue expansion.

## Variables, credentials and artifacts

| Name | Use |
| --- | --- |
| `PAGES_BASE` | Optional repository variable; defaults to `/<repository-name>/` |
| `PAGES_MEDIA_PROBE_VERIFIED` | Maintainer sets `true` after the one-file publication proof |
| `GITHUB_TOKEN` | Automatically supplied, scoped per job; no personal token is needed in workflow YAML |
| `VITE_API_BASE_URL` | Public frontend API build setting, not a credential |

Demo publication needs no AWS/SSH credentials. Build-time `VITE_` settings are visible to visitors and must not contain secrets. If LFS authentication or quota is unavailable, stop the dependent media job rather than broadening access or substituting another host silently.

`demo-dist` and `demo-media` have one-day retention and are consumed by the package job. `demo-pages`, HTTP audit and release audit have seven-day retention. `upload-pages-artifact` creates the Pages-compatible `github-pages` artifact from `.pages/` or `.pages-probe/`; its default retention is short, so rebuild expired deployments from a reviewed commit. `.nojekyll` is included. Never upload the whole checkout, a media cache, `.env` files or a pointer-only directory.

GitHub's [custom workflow documentation](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages) describes the artifact/deploy relationship, environment and permissions. The project's stricter budgets are 128 MiB for media and 256 MiB for the final artifact.

## Server Docker verification

`task ci:docker` requires a running Linux Docker engine. It exports the real `.dockerignore`-filtered `context-audit` target and verifies that media/data/docs/tasks/test output/local env are absent while required TS/ESLint/Vite modules remain. It then builds the API builder with `demo/` absent, audits rendered modules/files, builds the final Nginx target, copies its actual application files for inspection and tests Nginx configuration and HTTP responses.

The report is `test-results/docker-audit.json`. A context-only run (`node scripts/docker-verify.mjs --context-only`) leaves builder/runtime fields null; it must not be reported as successful image verification. The script removes only the containers/image tags it created and leaves Docker's ordinary build cache alone. No image is pushed by these checks.

## Legacy workflows and restoration

`frontend.yml` and `deploy-aws-ec2.yml` are retained, manual-only and guarded by `if: ${{ false }}` on their deploy jobs. `ci:yaml` enforces both conditions. They do not deploy, including when manually dispatched.

Before a deliberate restoration, a Maintainer reviews the retained scripts, current action/runner versions, deployment environment and required credentials. Relevant names include `VITE_API_BASE_URL`, `FRONT_SERVER_HOST`, `FRONT_SERVER_USER`, `FRONT_SSH_PRIVATE_KEY`, `FRONT_DEPLOY_PATH`, `AWS_REGION`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `VITE_API_BASE_URL_AWS`, `EC2_HOST`, `EC2_USER` and `EC2_SSH_KEY`. Verify destination/state and avoid overlapping Pages/server deployments. Remove the guard/change triggers only in a separately reviewed change; do not restore automatically during demo work.

That restoration must also deliberately update the corresponding disabled-workflow assertions in `scripts/check-yaml.mjs`; otherwise CI correctly rejects the newly runnable legacy job.

## Rollback and diagnosis

For a bad demo, stop new publication and select the previous successful reviewed commit. If its artifact is still usable, rerun the appropriate approved deployment through Actions. Otherwise run the workflow against that commit/ref, rebuild from the lockfile, pull its exact LFS objects, verify hashes and package again. Retain the probe gate and environment rules. Revert a bad code/media change through a new commit/PR; do not rewrite history or delete original sources.

- A missing Run workflow button usually requires checking default-branch registration and Actions policy.
- An environment/ref rejection requires the Maintainer to accept/configure the intended policy, not a bypass.
- LFS pointer/hash failures require the exact object and quota/authentication diagnosis.
- An MP3 returning HTML often indicates an incorrect base/path or a fallback route; inspect bytes and MIME.
- A local HTTP pass with a failed remote URL is an unresolved publication failure. Record the real status/headers and stop catalogue expansion.

Final local Docker verification on 2026-10-23 passed with 601 context files, a no-demo/no-LFS builder, 373 rendered API modules and 98 compiled output files. The final Nginx inspection passed with 99 application files (including the base image's `50x.html`), valid configuration and HTTP 200 for index/profile. No demo runtime/UI or music was present. This result includes the final API request-cancellation and chunk-splitting changes.

An earlier isolated Linux quality snapshot passed Task/actionlint, typecheck/lint and the demo/player/profile/media suites. All six current media/importer tests, scoped script lint and Task/actionlint were additionally rerun successfully on Windows and isolated Linux after the maintenance changes. One-file package/GET/HEAD/hash/MIME/206 range checks passed on both platforms; local Chromium playback/seek was observed separately.

The [remote CI run for source commit `c896a48`](https://github.com/sonar-diplomat/Sonar-front-end/actions/runs/40012693139) passed YAML, typecheck, lint and all 47 tests on both Windows and Ubuntu, then failed the mandatory metadata gate at missing audio 2. Its downstream jobs were skipped. The full CI result remains failing until the catalogue is complete.

Acceptance remains partial: the manifest currently has audio 1 while the seed references twelve tracks. The actual published probe, catalogue expansion/verification, complete `.pages/`, Pages workflow execution and full deployed browser acceptance still require observed results. Do not describe the standalone probe as full application acceptance.
