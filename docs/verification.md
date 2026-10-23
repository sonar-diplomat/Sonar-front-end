# Verification record

## Integration recheck: 2026-10-24

The remaining `chore/pages-workflow-bootstrap` history was consolidated into `feat/mock-demo-github-pages`. Its temporary `pages.yml` entry point conflicts with the full demo workflow; the executable demo workflow was retained, including the published-probe gate and deployment environment. The two legacy server workflows remain manual-only with disabled deployment jobs. This integration does not register a workflow on `master` or change deployment protection rules.

Repeated local checks on the integrated application:

| Check | Observed result |
| --- | --- |
| Quality | Task/actionlint, both TypeScript projects and full ESLint pass; all 47 tests pass (37 demo/player, 4 profiles, 6 media/importer) |
| Mandatory catalog gate | Full `task ci:check` still fails at `Missing manifest audio for seed track 2`; it has not been skipped or relaxed |
| API build | Passes; release audit verifies 373 rendered modules and 98 output files without demo runtime or audio |
| Demo build | Passes with explicit mock profile and lazy chunks; no chunk-size warning |
| Docker | Actual 601-file context, no-demo/no-LFS builder, runtime inspection, Nginx configuration and HTTP 200 pass |
| Standalone MP3 probe | Packages 6,572,309 bytes; GET/HEAD, length, MIME, SHA-256 and 206 seek checks pass |
| Compiled browser smoke | Home and populated library render; one audio element plays track 1 with advancing time, duration 205.078639 and readyState 4; seeking to 60 seconds and navigation retain playback; hash deep-link reload restores a paused position |

The browser smoke used the compiled demo with a diagnostic local media responder, not the incomplete final `.pages/` artifact. No application warnings/errors were observed during this smoke. Full twelve-track packaging, published Pages verification and physical mobile playback remain unverified. The existing one-track manifest still limits playback of the other eleven seed songs.

## Earlier verification

Local verification on 2026-10-23 used the frozen frontend source, Node 24.14.0 and dependencies installed with `npm ci --no-audit --no-fund`. Publication acceptance remains incomplete.

| Check | Observed result |
| --- | --- |
| TypeScript and ESLint | Both TypeScript projects pass; full ESLint passes with zero warnings |
| Automated tests | 37 transport/cancellation/player, 4 profile and 6 media/importer tests pass: 47 total |
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
- A fictional local account completed registration, confirmation through the displayed demo inbox link, login and session reload. Recovery produced a local reset link, updated its test password and allowed login with that new password. No real email or external account was used.
- Account email-change confirmation succeeded through its local inbox link. Reusing that link failed as already used. Password change rejected an incorrect current password, then accepted the correct one. Login with the new email/password and session reload passed; the old password was rejected. Reset restored login with the original seed credentials.
- A local Premium activation displayed price 5 and persisted a matching receipt after reload. A valid Track report saved locally; reasons now come from the selected type's canonical endpoint. The content-type catalog does not include Message, so that context explicitly reports unavailability.
- Settings regression: the date picker opens at the saved date instead of the current year. Keyboard changes, save/reload and cancel/reopen passed. February offered 29 days for 2000 and 28 for 2001; the saved value was 2001-02-28. Date values reset when the modal reopens, including after profile data loads.
- Named privacy selectors support arrows/Home/End, Enter and Escape with focus return. Friends/Only Me choices survived reload. Session revocation correctly includes the current device: both Revoke All and individual current-session revocation returned to sign-in, and Continue demo created a usable new local session. Final reset restored the seed; no application-origin warnings/errors occurred in this fresh compiled run.
- At a measured narrow content width of 433 CSS pixels, the album header/actions stayed inside the viewport and document scrollWidth equalled clientWidth. Earlier 355px checks covered queue controls and fixed-panel clearance. Viewport checks do not certify physical mobile playback.
- The checked application-origin console contained no warnings/errors. The latest observed asset inventory contained 31 resources and no API/Hub/refresh URLs. This inventory is not a complete network trace.

Additional earlier compiled scenarios, including chats/posts/settings and local form links, are recorded with their limits in [UI audit](demo-ui-audit.md). Automated tests also exercise cancellation through real legacy/RTK server adapter code with controlled fetch responses; a running backend integration test has not been performed. Remote LFS retrieval into fresh object storage matched the MP3 length and SHA-256.

The [remote CI run for source commit `c896a48`](https://github.com/sonar-diplomat/Sonar-front-end/actions/runs/40012693139) ran the actual Task pipeline on Windows and Ubuntu. Both jobs passed YAML validation, the two-project typecheck, ESLint and all 47 tests (37 + 4 + 6, zero failures). Both then failed at the mandatory `ci:data` gate with `Missing manifest audio for seed track 2`; downstream jobs were skipped. This is a failing full CI result, despite the preceding quality checks passing.

## Remaining acceptance

The seed references twelve songs, while the manifest contains only audio ID 1. Remaining media and measured durations must be registered after the real published one-file probe succeeds. Full metadata/CI, the complete `.pages/` package, distinct-track playback, a complete network trace, physical mobile playback and deployed deep-link/reload/reset checks remain pending. Local account confirmation/recovery/password-change flows are covered by the compiled checks above; they still need final-package acceptance.

Pages Source is configured for GitHub Actions. Default-branch workflow registration still needs normal review/acceptance, and the deployment environment currently permits only `master`. A Maintainer must accept the intended exact deployment refs under the existing protection process before a run can deploy. Publication is waiting; no successful external Pages URL or deployment is recorded. The verified-probe variable must remain unset until actual published delivery/playback/seek evidence exists. See [CI and Pages](ci-cd.md).
