# Pages UI regression — 2026-10-24

Baseline: the published mock demo at `https://sonar-diplomat.github.io/Sonar-front-end/`, deployed from `dev` commit `0a72f2a`. Fixes were reproduced against that deployment and checked in the compiled, media-complete `.pages/` preview under the same `/Sonar-front-end/` base.

## Findings and fixes

| Area | Reproduction | Result after the fix |
| --- | --- | --- |
| Profile navigation | Open the demo profile, Followers, then River Listener. The previous query's owner data redirects back to the demo profile. | Read RTK Query `currentData` for the requested identifier. The guest profile opens; following and its count survive reload. |
| Dialog keyboard access | Open playlist editing or the date picker. Focus remains behind the overlay; Tab escapes; dialogs have no accessible role/name. | Dialog semantics, initial focus, Tab/Shift+Tab containment, Escape and focus restoration. Inline close callbacks no longer restart focus on each edit. Replacing menu controls with a playlist selector refocuses the open dialog. |
| Nested player menu | Open the full player, Song actions, then press Escape. | Only the top dialog closes; focus returns to Song actions and the player remains open. |
| Input and button names | Search, creation forms, message input and playback switches lack accessible names. Several icon buttons have no text alternative. | Shared inputs use their placeholder as a fallback name; explicit names cover switches, post fields, group/member controls and folder navigation. |
| Keyboard actions | Chat rows, group members and top songs respond only to pointer clicks. | Chats and members are buttons; top songs support Enter/Space without nesting the menu button inside the playback control. |
| Light theme | The date picker's selected text is dark on a hardcoded dark dialog. Recovery headings, Terms headings, registration consent and the Premium banner also lose contrast. | Theme tokens for dialogs, forms, consent and chat surfaces; explicit white title on the intentionally dark Premium banner. |
| Library creation control | Light theme forces a dark background onto the creation tile while its text/icon remain dark, making Create New appear empty. | Use the shared dark-button palette in both themes and remove the conflicting background override. The label and plus remain visible; the creation route opens. |
| Category filters | The selected chip inherits the shared button's growing flex layout, stretching All across the row. | Scope a fixed-content flex layout to ChipsBar buttons and expose selection with `aria-pressed`. All/Albums/Playlists keep their widths when selected. |
| Empty playlist | A newly created playlist shows “Start listening” without an available playback action. | Hide the playback panel until there are playable tracks. The empty-state guidance remains visible. |
| Contextual reporting | The playlist menu uses a hardcoded User type ID, so the report cannot save; its old modal also suggests contacting real support. | Route menus to the shared report page, resolve types by catalog name and prefill the entity ID. Unsupported album/artist contexts are explicit. Changing report context resets the form/result. |
| Unsupported demo actions | Scheduling publishes immediately because the local transport ignores the requested publication date. Chat notification changes do not provide notifications. | Disable these two controls in mock mode and explain the limitation. API-profile controls retain their existing behavior. |

## Browser coverage

Browser viewport checks used 1440 × 1000, 390 × 844 and 320 × 740. These are responsive desktop-browser checks, not physical iOS/Android device certification. Checked pages had no document-level horizontal overflow; catalog carousels retain intentional horizontal scrolling.

The library follow-up also checked 740 × 844 and 1280 × 720 in light theme, plus 320 × 740 in both themes. Create New has contrasting text/icon, filter selection changes the displayed collection type without stretching a chip, and the creation button opens the Playlist/Folder chooser. Console errors and warnings remained absent.

| Flow | Evidence |
| --- | --- |
| Home, Search, Library and creation | Catalog navigation; search result starts a real MP3; folder/playlist creation; empty playlist; rename, save and reload. |
| Profiles and artists | Own profile → followers → guest profile; follow/count persistence; artist music/posts; text post creation; missing user/artist states. |
| Collections and track links | All three album pages, Favorites, an empty playlist, track detail and the long title on track 12; missing collection/track states. |
| Player | One audio element; actual time advancement; album queue; rapid next across distinct MP3 sources; seek, mute, pause, repeat controls; saved source/time/mute restored paused after reload. |
| Dialogs | Date picker at 320 px in light theme; Tab/Shift+Tab wrapping; Escape and focus return; playlist input retains focus while editing; nested player menu closes independently. |
| Chats | Send a local message; create a group with a searched member; open it with Enter; member list and chat details; report link preselects the user. |
| Settings | Account, sessions, privacy, blocked accounts, appearance, playback and About render; theme/privacy/explicit-content changes save and survive reload; local demo reset returns to Home. |
| Premium, sharing and reporting | Local plan activation creates a receipt; Track/Playlist reports save locally with the correct type; unsupported Album context shows an unavailable state; a track share link and QR render and Copy Link succeeds. Reports do not claim to contact moderation. |
| Entry and ancillary routes | Three welcome steps, entry/login, required-field validation, registration form, local recovery inbox/reset form, Terms link, incomplete confirmation and 404/home recovery; read-only diagnostics returns Track/1. Credential replacement and legal consent were not repeated in this regression. |

No console errors or warnings were captured during these browser flows. This does not certify every backend error path or every browser engine.

## Automated verification

- `task ci:check`: TypeScript, ESLint, YAML, seed integrity and 47 tests pass.
- `task build:release`: API bundle audit passes without mock runtime or binary media.
- `task build:demo`, `task pages:package`, `task pages:smoke`: compile, verify and package 12 MP3s plus 14 images; all 26 HTTP GET/HEAD/hash/MIME checks and MP3 range checks pass.
- The PR pipeline must also pass its Windows/Linux checks and actual Docker release audit before deployment.

The demo continues to use local browser data. Email delivery, payments, moderation, scheduled publishing, chat notifications, crossfade and automatic recommendations are outside the published mock implementation. Real backend integration and physical-device checks remain separate acceptance work.

## Dialog and library follow-up — 2026-10-26

Baseline: the Pages deployment from `dev` commit `4f7909d`.

- Group creation, member selection and member actions now use the existing background, border, overlay and text tokens in both themes. Member action icons inherit their text color; removal retains the theme's danger color. Narrow search fields can shrink and long member identifiers can wrap.
- The chat information page uses the same page palette so the controls that open these dialogs are readable in light theme. Its orange profile banner keeps its existing palette.
- Library retains its 1200 px desktop limit, rounded creation tile and horizontal card rows. Search, section headings and the first folder/collection card share a 16 px inner inset. The header width is overridden only for Library, and card insets are opt-in; the loading skeleton uses the same spacing. Obsolete viewport-wide folder overrides are removed.
- About displays the compiled artifact's UTC build date/time and year instead of a fixed date. The shared settings cards also follow the theme, keeping the new metadata readable. See [build profiles](build-profiles.md#build-versus-publication) for the timestamp contract.

The media-complete compiled preview was checked at 1280 × 720, 740 × 844 and 320 × 740. Checks covered both themes, all three dialogs, member search, Tab/Shift+Tab containment, Escape/focus return, Library filters and nested-folder navigation. Search and section headings share their left edge; no document-level horizontal overflow was observed. About showed the same timestamp as `.pages/build-profile.json`. Real MP3 playback advanced while navigating to Library and was paused after the check. The final-build browser session had no console errors or warnings.

Validation: 47 automated tests, TypeScript, ESLint, YAML and seed checks; API build/isolation audit; demo compilation, media verification, Pages packaging and all 26 HTTP GET/HEAD/hash/MIME checks plus MP3 ranges. The PR pipeline additionally checks Windows/Linux and the actual Docker container before merge.

## Five confirmed frontend defects

Baseline: `dev` commit `143cb2f`. Acceptance used a fresh, media-complete `.pages/` package with the `/Sonar-front-end/` base, rather than an older preview or a development server.

| Defect | Implementation | Verified result |
| --- | --- | --- |
| P1: same-name group member targeting | `POST Chat` has a success-only response without a created ID. Keep the RTK result `void`, align mock with that contract, compare fresh chat IDs before/after creation and require one matching new group owned by the current user. Reject missing/ambiguous identity before any member additions. Surface member-add failures without reporting success. | Two groups named identically received different IDs and separate selected members in the packaged demo. The first group remained unchanged. Eight transport/orchestration regressions cover duplicate names, failed snapshots/creation, absent or ambiguous IDs, invalid metadata and partial member-add failures. |
| P2: confirmation contrast | The shared `ConfirmEmail` component uses theme background, text and underlined link colors, with a visible keyboard outline. Layout and spacing live in its CSS module. | Both confirmation routes render readable incomplete/error states at every tested size/theme. Deterministic component fixtures also covered incomplete/loading/success/error in both themes at 320 px. |
| P2: post editor contrast and mobile layout | Theme colors apply to entered text regardless of focus. Fields can shrink inside the card, textarea text is at least 16 px, focus outlines do not change dimensions, and actions wrap. Schedule keeps a 140 px minimum width and can display a date without clipping. | Entered title/body remained readable after blur, without horizontal movement at 320 px. Both themes and profiles passed form-level checks. The packaged mock post published with the keyboard and survived reload. Mock scheduling stayed disabled with its explanatory text. |
| P2: stale member searches | Both dialogs read `currentData` for the active submitted identifier, hide pending/cleared results, clear the submitted identifier on edits/Add, and unmount their local dialog state on close. A changed target chat also resets Add Members. | A → Add → B → Add → remove A → close/reopen passed in both dialogs. Ten real React/RTK Query regressions exercise that sequence, delayed A success/error after B, cached old results during a new search, a late response after reopening, self/selected/existing-member guards and error reset. |
| P2: folder input name | The existing folder input explicitly exposes `aria-label="Folder name"`. Validation and submission are unchanged. | Accessibility tree reports `Folder name`. Tab reaches the input and Create folder; whitespace-only input disables creation, and Enter with a valid name creates the folder. |

### Packaged browser acceptance

Checked dark and light themes at 320 × 740, 740 × 844 and 1280 × 720. The matrix contained 36 page checks and 12 dialog checks across the affected folder, confirmation, post and chat flows. No document-level horizontal overflow, out-of-container fields or clipped action labels were detected. Entered values and focus transitions remained usable. Both dialogs retained Tab/Shift+Tab containment, Escape closure, focus return and clean reopening. No application console warnings or errors were captured.

The folder accessibility/validation/keyboard flow, separate membership of the two same-name groups and local post publication/reload were verified against this same package. Confirmation error cases were opened as fresh direct links. Loading/success rendering was checked through controlled component states rather than live email delivery.

### Automated and artifact verification

- `task ci:check` passed: TypeScript, ESLint, Task/actionlint YAML validation, seed relations and 65 tests (55 domain/player/dialog, 4 profile and 6 media/importer tests).
- `task build:release` passed, including the API isolation audit: 370 rendered modules and 99 output files without demo runtime or binary media.
- `task build:demo` passed.
- `task pages:package` verified 12 MP3s and 14 images and produced an 86,204,334-byte package.
- `task pages:smoke` passed all 26 GET/HEAD/hash/MIME checks and MP3 seek-range checks.
- Regression sources are `src/shared/demo/group-chat.test.ts` and `tests/chat-member-dialogs.test.mjs`. The latter mounts the production dialogs with React and RTK Query in jsdom and controls response completion order. It checks behavior rather than duplicating CSS declarations and runs through the existing CI test command.

### Acceptance limits and publication

Responsive checks used a desktop browser; physical iOS/Android devices and other browser engines were not certified. The real API server, outbound email and server-side scheduled publication were not exercised. The existing one-attempt confirmation guard is unchanged: changing between token URLs in an already-mounted confirmation component can retain the previous attempt, so direct-entry confirmation cases used fresh loads.

This package is locally accepted and is not a Pages deployment. Feature-branch and PR checks do not publish Pages. The `dev` ruleset requires one approving review and approval of the latest push before merge; the existing `dev` Pages workflow performs publication after its checks and environment requirements are satisfied. PR CI results and any later publication must be reported separately from local package acceptance.
