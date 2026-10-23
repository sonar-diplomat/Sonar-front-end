# Demo UI audit

Status: UI source checkpoint frozen. A stable compiled preview was checked under `/Sonar-front-end/` with one available MP3. Fresh-package regression checks, distinct-track playback and published Pages acceptance remain pending. A Redux play flag alone is not playback evidence.

The later fresh compiled regression is recorded in [verification](verification.md): Library album/filter, playlist rename/delete/reload, cross-tab preservation while playing, reset-to-home, uploaded cover reload/reset and narrow header geometry passed. Historical checkpoint results below identify the bundle they tested; final `.pages/` and published acceptance remain pending.

A subsequent compiled form pass completed fictional account registration, inbox confirmation, login/session reload, recovery/password replacement and login again. Premium activation retained the displayed amount after reload. Report reasons now use the canonical per-entity query; a valid Track report saved, while unsupported Message context is explicitly unavailable. Both registration Terms links retain the project base/hash. Reset restored the original demo user afterward.

The latest compiled account pass confirmed email change, rejected reuse of the confirmation link and rejected password change with an incorrect current password. A valid password change allowed login with the new email/password and retained the session after reload; the old password failed. Reset restored the original seed login. Date/privacy keyboard persistence and current/all-session revocation also passed. These later results supersede the corresponding historical pending checks below; final-package and deployed acceptance remain outstanding.

## Findings

| ID | Priority | Reproduction / evidence | Change | Status |
| --- | --- | --- | --- | --- |
| UI-01 | P0 | Mock songs request authenticated stream API. | Manifest resolver and direct static MP3 source; API stream retained. | Actual ID 1 MP3 loaded and advanced in compiled preview |
| UI-02 | P0 | Track switch creates another audio element and uncancelled fade timers; object URL can be revoked while in use. | One persistent audio element, generation guards, source ownership and cleanup. | One active element continues through navigation; rapid distinct-track changes pending |
| UI-03 | P1 | Collection playback bypasses shared transport. | ApiClient with album array and playlist cursor DTO handling. | Album playback and playlist queue verified |
| UI-04 | P1 | Premium, track/share and report routes fall through to NotFound. | Lazy pages and canonical shared queries/mutations. | Routes render; local Premium receipt verified; exact-price correction awaits rebuilt preview |
| UI-05 | P1 | Artist profile uses independent mock arrays and can load forever on 404. | Shared search and explicit missing/error/empty states. | Canonical artist content and artist 999 missing state verified |
| UI-06 | P1 | Library rows always link to playlist, including album IDs; category selection mixes entity types. | Type-aware links, filtering and canonical navigation. | Reproduced in compiled preview; source corrected, rebuilt retest pending |
| UI-07 | P1 | Seek accepts mouse only; macro previous disabled on last track; repeat/volume/mute missing. | Native ranges and shared controls. | Actual seek, mute, volume, repeat and shuffle verified; next/previous across distinct MP3s pending |
| UI-08 | P1 | Rejected play promise leaves playing intent and logs errors. | Visible playback error, paused intent, visitor-triggered retry. | Reducer regression passes; forced rejection/source failure browser check pending |
| UI-09 | P1 | Repeat-one does not restart source; manual next is intercepted by repeat-one. | Ended-event repeat and separate manual navigation. | Actual same-source restart verified; reducer next/all tests pass |
| UI-10 | P1 | Position interval restarts each time update; restore can overwrite newer queue. | Stable subscription/timer and separate versioned ID persistence. | Pause/deep-link reload restores actual position paused |
| UI-11 | P1 | Blocked accounts is a permanent local empty array. | Shared settings/user queries and unblock mutation. | Empty route verified; populated unblock scenario pending |
| UI-12 | P1 | Demo recovery/registration claims an email was sent. | Explicit local outbox and usable token links. | Recovery outbox opens reset form; credential mutation and complete signup pending |
| UI-13 | P1 | Account deletion logs then logs out; forms have inactive attachment actions. | Honest unavailable account deletion; text/link post composer. | Post create/reload verified; attachment correction awaits rebuilt preview |
| UI-14 | P2 | Routes and macro player imported eagerly. | Lazy modules and on-demand full player. | Production build passed without chunk-size warning; final size owned by build verification |
| UI-15 | P2 | Tab state can disagree with navigation; profile icon buttons lack names. | Location-based selection and labelled working controls. | Source corrected; rebuilt keyboard/back-forward regression pending |
| UI-16 | P1 | Narrow collection header clips because of fixed 362px width. | Fluid collection container; native sliders/dialog focus handling. | Reproduced at 355px content width; source corrected, rebuilt visual retest pending |
| UI-17 | P1 | Initial app TypeScript and UI lint fail. | Scoped type/import fixes; metadata layer uses its shared owner. | Final app TypeScript and scoped UI lint pass |
| UI-18 | P1 | Playlist Edit opens unrelated action menu, no rename/delete form. | Owner-only canonical rename/delete; Favorites protected. | Reproduced; source corrected, rebuilt CRUD retest pending |
| UI-19 | P2 | Chat order changes from descending to ascending after sending. | Chronological presentation independent of transport event ordering. | Send/edit/delete/reload pass; ordering correction awaits rebuilt preview |
| UI-20 | P1 | Reset restores data but reload races navigation and leaves Settings open. | Await router navigation before reload; player reset discards queue. | Seed/theme restoration verified; destination correction awaits rebuilt preview |
| UI-21 | P0 | Development media middleware intercepts JSON module imports with 404; root stays empty. | JSON requests delegated to Vite by media middleware. | Both JSON imports return JavaScript/200; app starts |
| UI-22 | P1 | Account field contains 2000-01-01, but the opened picker selects the current year; cancelled edits can remain selected. | Mount date fields from the current saved value when the modal opens; normalize day values and restrict days by month/year. | Initial value, keyboard selection, leap-year February, save/reload and cancel/reopen verified |
| UI-23 | P2 | Date wheels are unfocusable and settings selectors lack associated names and arrow-key navigation. | Named listboxes/options, active selection, keyboard navigation, Escape focus return and named settings Back buttons. | Date and privacy keyboard flows verified; Friends/Only Me persisted after reload |
| UI-24 | P1 | Revoke All promises to exclude the current device, but the endpoint revokes every session and leaves the screen showing an empty list. | Correct confirmation, mark current device, show failures and navigate to sign-in after revoking the current/all sessions. | Both revoke paths and return through Continue demo verified |

## Stable compiled browser evidence

The preview contained source from the earlier compiled checkpoint, one actual MP3 and the current covers. Source fixes listed as awaiting rebuild were not certified by testing an older bundle. Application diagnostics exclude unrelated browser-extension messages.

- Search for Carefree returned one canonical track. Album 101 showed four canonical records. Visiting profile, library, Favorites and playlist routes used the same IDs.
- Clicking Play loaded `demo/audio/1.mp3`. Actual element state: `readyState=4`, duration `205.078639`, `paused=false`, advancing currentTime. Exactly one audio element remained while navigating from home through library and Favorites.
- Keyboard seek changed actual media position to `20.5` and playback continued. Pause followed by deep-link reload restored the same source at `21.307617` with `paused=true`. An independent desktop check restored `94.006123` paused.
- Mute changed actual `audio.muted` to true. Volume changed actual controller volume to `0.95`. Repeat-one after seeking to the end restarted the same MP3, advancing from `3.631168`. Repeat cycles off/all/one; shuffle preserves the active source.
- Adding the current Carefree song created a separate queue entry; removing that duplicate left the other queue entry intact. Different-track next/previous and source failure are still pending because only one MP3 is delivered.
- Removing Carefree from Favorites changed canonical playlist 201; adding it back survived reload. Creating `Persistence QA` produced an empty playlist with no misleading Play action and survived single-tab reload.
- Chat 1: send, edit, reload and delete all persisted. An artist text post persisted after reload. Saving Light theme, waiting for completion and reloading retained Light.
- Demo Premium activation produced a local receipt. No payment was sent. The final source passes the exact plan price; this latest correction needs a rebuilt interaction check.
- Reset restored the seed, removed the custom playlist and restored Dark theme. The tested older bundle retained the settings destination; the final source awaits navigation before reload.
- Password recovery shows a local outbox link; opening it rendered the password assignment form. No actual email is sent. Credential change was not submitted in this smoke.
- No application-origin console errors or warnings occurred in the stable compiled smoke. Earlier React Router hydration warning was corrected with a root loading fallback.

## Route coverage

Content/heading checks covered home, search, album, playlist, artist music/posts, user profile, library and chats, plus these auxiliary routes: `/entry`, `/register`, `/login`, `/confirm-email`, `/confirm-email-change`, `/assign-new-password`, `/terms`, `/library/create/folder`, `/settings/account`, `/settings/sessions`, `/settings/privacy`, `/settings/blocked-accounts`, `/settings/playback`, `/settings/about`, `/report`, `/test/api`, missing artist and unknown route. Heading checks alone do not certify every form mutation. `/test` is now a diagnostic landing page instead of a dead tab showcase; fresh-bundle verification remains pending.

## Mobile layout evidence

Desktop Chrome viewport was set to 390 by 844; actual content width was 355px. No document-level horizontal overflow was observed in library, album or the expanded player. Album Play loaded the real MP3 with advancing actual time. Macro controls and queue removal worked at this width; the final album row could be scrolled fully above the fixed player and bottom navigation. The fixed-width collection header clipping was found during this check and corrected in source. Physical mobile playback, touch seek and mobile browser audio policy remain unverified because no mobile device/browser is available.

## Automated verification at source freeze

- `tsc -p tsconfig.app.json --noEmit`: pass after the final source corrections.
- Scoped ESLint covering app/pages/widgets/shared UI and hooks, owned helpers, player and Music API: zero errors and zero warnings.
- `node --experimental-strip-types --test src/shared/store/features/player/playerSlice.test.ts`: five tests pass: duplicate identity/history, repeat navigation, shuffle add/remove, finite duration/seek, paused restore/error.
- A demo production build completed with lazy route/full-player chunks without a size warning. Subsequent build, lockfile install, API graph audit and package ownership remain with release verification.
- The development server is stopped and no temporary startup diagnostic page remains.

## Outstanding acceptance

1. Repeat the checked form interactions in the final package. Exact Premium price, signup/confirmation/login/recovery and a valid Track report passed in fresh compiled checks, alongside Library/filter, playlist CRUD, reset destination, named profile controls and narrow header regression.
2. Deliver the remaining licensed MP3s after the required publication probe, then test distinct sources, fast switching, next/previous, queue completion, loading failure/retry and final credits.
3. Run the full search → album → playback → seek → queue → favorite/playlist → reload/reset sequence against final `.pages/`, then the actual Pages URL and shared deep links.
4. Publication requires Maintainer acceptance of the deployment environment/branch and workflow review. Dependent publication and media-delivery steps remain pending; branch protection must not be bypassed.
5. API transport external AbortSignal forwarding is corrected. Five cancellation regressions exercise pre-abort, pending fetch, timeouts, response bodies and the real adapters without retries; actual backend streaming integration remains unverified.
6. The cross-tab state overwrite regression passed on the fresh compiled preview while audio progress was being saved. Player position remains a separate last-writer preference, not cross-tab playback coordination.
7. A physical mobile browser remains outside completed smoke evidence. Local email/password confirmation, date/privacy save/reload and current/all-session revocation are now checked. Message reporting is unavailable because the current content-type catalog has no Message entry. Do not declare the complete demo accepted until required final-package and distinct-track/published checks are performed.
