# Verification record

Local verification on 2026-10-23 used the frozen frontend source, Node 24.14.0 and dependencies installed with `npm ci --no-audit --no-fund`. Publication acceptance remains incomplete.

| Check | Observed result |
| --- | --- |
| TypeScript and ESLint | Both TypeScript projects pass; full ESLint passes with zero warnings |
| Automated tests | 36 transport/cancellation/player, 4 profile and 6 media/importer tests pass: 46 total |
| YAML | Task parses 5 Task files; actionlint validates 4 workflows and disabled legacy deployment guards |
| Full `task ci:check` | Tests pass, then the mandatory metadata gate fails with `Missing manifest audio for seed track 2` |
| API build and audit | Production build passes; 373 rendered modules, 98 output files, no demo runtime/UI or audio |
| Demo compilation | Production build passes with lazy routes/player and an explicit mock profile; no size warning |
| Docker | Actual filtered context has 601 files; no-demo builder, API audit, final Nginx files, `nginx -t` and HTTP index/profile checks pass |
| Media/probe | One MP3 and 14 SVGs verify; standalone probe packages 6,572,309 bytes; GET/HEAD, length, MIME, SHA-256 and 206 range checks pass |

## Compiled browser checks

Chrome checked the compiled application under the project base using a diagnostic local server with the one verified MP3. This is separate from the final `.pages/` artifact.

- Home, search, album, library and profile content render. Library album filtering opens album 101 through its correct hash route. Profile chat/settings buttons have accessible names.
- The single audio element loads `demo/audio/1.mp3`, reports duration 205.078639, readyState 4 and advancing time while playing. Navigation retains its source. A deep-link reload restores a paused position; one measured restore was 62.092603 seconds.
- While that audio played in one tab, a second tab created a playlist. Renaming propagated and survived reload in both tabs despite playback progress writes. Playlist deletion returned to the library.
- Reset awaited completion, returned to home, restored seed collections/dark theme and cleared the player source.
- An uploaded SVG cover displayed through a blob URL, survived reload with a newly hydrated blob URL and natural width 512, and its playlist disappeared after reset.
- At a measured narrow content width of 433 CSS pixels, the album header/actions stayed inside the viewport and document scrollWidth equalled clientWidth. Earlier 355px checks covered queue controls and fixed-panel clearance. Viewport checks do not certify physical mobile playback.
- The checked application-origin console contained no warnings/errors. The latest observed asset inventory contained 31 resources and no API/Hub/refresh URLs. This inventory is not a complete network trace.

Additional earlier compiled scenarios, including chats/posts/settings and local form links, are recorded with their limits in [UI audit](demo-ui-audit.md). Automated tests also exercise cancellation through real legacy/RTK server adapter code with controlled fetch responses; a running backend integration test has not been performed.

## Remaining acceptance

The seed references twelve songs, while the manifest contains only audio ID 1. Remaining media and measured durations must be registered after the real published one-file probe succeeds. Full metadata/CI, the complete `.pages/` package, distinct-track playback, the full form matrix, a complete network trace, physical mobile playback and deployed deep-link/reload/reset checks remain pending.

Pages Source is configured for GitHub Actions. Default-branch workflow registration still needs normal review/acceptance, and the deployment environment currently permits only `master`. A Maintainer must accept the intended exact deployment refs under the existing protection process before a run can deploy. Publication is waiting; no successful external Pages URL or deployment is recorded. The verified-probe variable must remain unset until actual published delivery/playback/seek evidence exists. See [CI and Pages](ci-cd.md).
