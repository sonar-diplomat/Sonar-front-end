# Build profiles

| Property | API | Demo |
| --- | --- | --- |
| Command | `npm run build` | `npm run build:demo` |
| Data source | `api` by default | `mock` in `.env.demo` |
| Vite command | `vite build` | `vite build --mode demo` |
| Output | `dist/` | compilation in `dist/`, publication in `.pages/` |
| Default base | `/` | `/Sonar-front-end/` |
| Router | browser history | hash |
| Data/realtime | real API/SignalR | local state/events |
| Binary media | server URLs | verified standalone static files |

Both commands first run the explicit two-project TypeScript check and produce minified production assets. `--mode demo` selects environment files while retaining production build optimization. Development flags, hostname and branch do not select data sources. These semantics follow [Vite environment documentation](https://vite.dev/guide/env-and-mode).

Routes and the expanded player load lazily. SignalR loads when an API connection is constructed; the React rendering runtime is a separate shared cacheable chunk. The 2026-10-23 builds emitted a 355.54 kB API application entry and 357.25 kB demo entry, plus a 189.80 kB React chunk (minified, before gzip). Neither build changed the default size-warning threshold.

`VITE_DATA_SOURCE` accepts exactly `api` and `mock`; unset means `api`, empty/unknown values fail. The npm demo commands explicitly set `mock` using cross-env on Windows/Linux. Direct Vite invocation follows process-environment precedence over environment files. Check CI environment variables when an unexpected profile is reported. `VITE_BASE_PATH` must be an absolute pathname with a trailing slash. It controls Vite's `BASE_URL`, all demo media URLs and the packaged preview path.

## Isolation boundary

`src/shared/config/data-source.ts` exposes the selected mode. Runtime/dispatcher imports are dynamic and guarded. Vite resolves mode aliases to mock modules/JSON only for mock and to inert API modules otherwise. API does not resolve source paths under `demo/`, so LFS media and the entire demo directory can be absent during its build. The TypeScript seed/media declarations contain no binary dependencies.

The build emits `dist/build-profile.json` with `dataSource`, `base` and portable IDs of modules contributing rendered code. Release verification checks this audit and output files for unwanted mock/media content. Packaging rejects an API artifact. Server Docker ignores demo data/media and validates its API artifact; it never downloads LFS.

## Build versus publication

Compilation does not copy MP3 files into `dist/`. The media pull/verify/package stages produce `.pages/` containing ordinary audio bytes, images and attribution alongside application assets. LFS pointers and raw LFS URLs are not playable publication files. See [media storage](media-storage.md) for hashes/provenance and [CI and Pages](ci-cd.md) for ordered tasks.

Use hash links such as `/Sonar-front-end/#/album/101` for demo deep links. Reload requests the static project root; the client reads the hash. API routes retain server rewrite requirements. Do not infer a successful deployed route/audio test from a local build result.
