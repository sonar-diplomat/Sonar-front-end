# Development

## Requirements

Use Node.js 24.14.x (`.nvmrc`; Node 24 is also selected in CI), npm and Git. Task, Git LFS and Docker are needed for their respective checks; see [tasks](tasks.md) and [media storage](media-storage.md). A real backend is needed for API profile network scenarios. It is not needed for demo.

Install exactly the committed dependency graph:

```sh
npm ci --no-audit --no-fund
```

The same commands run in PowerShell and POSIX shells. Do not replace `npm ci` with an unreviewed lockfile update during validation.

## API development

Copy `.env.example` to `.env.local`. Configure `VITE_API_BASE_URL`, and `VITE_MEDIA_BASE_URL` when media uses another origin. `VITE_PROXY_TARGET` configures the development server proxy only; browser API URLs must point to that proxy to use it. All `VITE_*` values are public browser configuration; never store secrets in them.

```sh
npm run dev
```

API is the default when `VITE_DATA_SOURCE` is absent. Server refresh/session and SignalR behavior remain available in this profile.

## Demo development

```sh
npm run dev:demo
```

This selects `.env.demo`, local seed/session and hash routes under `/Sonar-front-end/`. Obtain the verified media described in [media storage](media-storage.md); Vite serves those files without importing them into JavaScript. Audio begins after a visitor presses Play. Demo mutations persist in namespaced browser storage, and the reset action restores seed without clearing API credentials.

For the final publication artifact, use the ordered build/media/package/preview steps in [CI and Pages](ci-cd.md). `vite preview` serves compilation output; the packaged `.pages/` preview is the acceptance target for media and project-base routing.

## Checks

`npm run typecheck` explicitly checks both application and Node/config TypeScript projects. Running bare `tsc` against the references-only root is insufficient. `strict`, unused-code checks and real source coverage remain enabled. ESLint covers working TypeScript/JavaScript sources and ignores generated artifacts.

```sh
npm run typecheck
npm run lint
npm run test:demo
npm run test:media
npm run test:profiles
npm run yaml:check
```

Use the same [Task commands](tasks.md) invoked by CI. Install dependencies before checks, compile before packaging, and obtain/verify actual LFS bytes before publication.

## Branch integration

`dev` is the integration branch; `master` is the repository default branch. Existing commits and merge parentage are retained. The ArtistProfile ownership/form changes are integrated with LoadingImage support. Required Input/Button/TabBar/player and Vite/TypeScript modules remain because current imports depend on them; the obsolete Input example was removed. LoadingImage and previously merged feature branches were not merged again.

The demo work starts at the integrated `dev` in `feat/mock-demo-github-pages`. Submit changes through pull requests according to repository rules. Do not force push or bypass protection. Backend changes are a separate scope. Both legacy deployment workflow files remain manual-only and their deploy jobs are disabled.
