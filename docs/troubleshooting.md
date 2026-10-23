# Troubleshooting

## TypeScript and lint

Run `npm ci` using the Node version in `.nvmrc`, then `npm run typecheck` and `npm run lint`. Bare `tsc` reads a references-only root and does not provide the full application check. Keep strict checks enabled and fix DTO/import/call-site mismatches. Do not exclude working sources or replace errors with broad `any` casts.

ESLint parser errors saying a file is absent from the project indicate tsconfig coverage or stale generated output. Application sources belong to `tsconfig.app.json`; config/declaration sources belong to `tsconfig.node.json`. Build output is ignored by ESLint. Scoped `eslint --fix` can repair import ordering; review semantic fixes separately.

## Wrong profile or missing data

Check `dist/build-profile.json` and the build environment. Unset `VITE_DATA_SOURCE` means API. Use `npm run dev:demo` or `npm run build:demo` for mock. Empty/unknown values fail configuration. Process environment has precedence over `.env.demo`. Do not select profiles by hostname or development mode.

Mock endpoint errors include method/path and status. Add or correct the handler using the existing DTO rather than allowing a network fallback. Demo must not issue API, refresh-token or Hub requests. After schema changes, use the documented reset action; it clears only demo-owned state. Browser storage may be unavailable in restricted/private contexts, where persistence must be reported accurately.

## Missing or silent audio

Obtain selective LFS media and run the verification command from [media storage](media-storage.md). A small text file beginning `version https://git-lfs.github.com/spec/v1` is a pointer, not audio. Check the manifest path, MIME, byte size and hash. Build compilation alone does not copy binary media; use the packaged `.pages/` preview.

Press Play to grant normal browser user activation. Inspect audio errors and the loaded static URL when playback fails. Seek requires valid duration and range-capable serving. Autoplay denial must not leave the player falsely marked as playing. Test actual progress and seeking rather than only button state.

## Pages paths and publication

Verify `VITE_BASE_PATH` matches the project path, including capitalization and trailing slash. Demo routes use `/#/…`; assets and media use `BASE_URL`. Test a deep link after reload on the actual Pages origin. A successful local build does not prove publication.

If Pages is disabled, a Maintainer must select Settings → Pages → Source: GitHub Actions. The `github-pages` environment must permit the chosen deployment branch. Manual dispatch requires the workflow to exist on the default branch, currently `master`; prepare the required pull request and wait for acceptance. Do not broaden permissions, change plans or bypass protection to deploy. See [CI and Pages](ci-cd.md).

## Docker and authentication

Docker checks require a running daemon, not only an installed CLI. Start the installed Docker engine and retry the documented command. Verify the filtered context and final image as well as `dist/`; demo content must be absent from all three. A context-only check does not confirm image creation.

Git-over-SSH, the GitHub connector, browser login and GitHub CLI authentication are separate sessions. A failed `gh auth status` does not prove Git or browser access is unavailable. Do not print tokens or copy credentials between sessions. Maintainer-only configuration remains a separate required action.
