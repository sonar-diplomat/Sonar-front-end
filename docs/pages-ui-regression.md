# Pages UI regression — 2026-10-24

Baseline: the published mock demo at `https://sonar-diplomat.github.io/Sonar-front-end/`, deployed from `dev` commit `0a72f2a`. Fixes were reproduced against that deployment and checked in the compiled, media-complete `.pages/` preview under the same `/Sonar-front-end/` base.

## Findings and fixes

| Area | Reproduction | Result after the fix |
| --- | --- | --- |
| Profile navigation | Open the demo profile, Followers, then River Listener. The previous query's owner data redirects back to the demo profile. | Read RTK Query `currentData` for the requested identifier. The guest profile opens; following and its count survive reload. |
| Dialog keyboard access | Open playlist editing or the date picker. Focus remains behind the overlay; Tab escapes; dialogs have no accessible role/name. | Dialog semantics, initial focus, Tab/Shift+Tab containment, Escape and focus restoration. Inline close callbacks no longer restart focus on each edit. |
| Nested player menu | Open the full player, Song actions, then press Escape. | Only the top dialog closes; focus returns to Song actions and the player remains open. |
| Input and button names | Search, creation forms, message input and playback switches lack accessible names. Several icon buttons have no text alternative. | Shared inputs use their placeholder as a fallback name; explicit names cover switches, post fields, group/member controls and folder navigation. |
| Keyboard actions | Chat rows, group members and top songs respond only to pointer clicks. | Chats and members are buttons; top songs support Enter/Space without nesting the menu button inside the playback control. |
| Light theme | The date picker's selected text is dark on a hardcoded dark dialog. Recovery headings, Terms headings, registration consent and the Premium banner also lose contrast. | Theme tokens for dialogs, forms, consent and chat surfaces; explicit white title on the intentionally dark Premium banner. |
| Empty playlist | A newly created playlist shows “Start listening” without an available playback action. | Hide the playback panel until there are playable tracks. The empty-state guidance remains visible. |
| Unsupported demo actions | Scheduling publishes immediately because the local transport ignores the requested publication date. Chat notification changes do not provide notifications. | Disable these two controls in mock mode and explain the limitation. API-profile controls retain their existing behavior. |

## Browser coverage

Browser viewport checks used 1440 × 1000, 390 × 844 and 320 × 740. These are responsive desktop-browser checks, not physical iOS/Android device certification. Checked pages had no document-level horizontal overflow; catalog carousels retain intentional horizontal scrolling.

| Flow | Evidence |
| --- | --- |
| Home, Search, Library and creation | Catalog navigation; search result starts a real MP3; folder/playlist creation; empty playlist; rename, save and reload. |
| Profiles and artists | Own profile → followers → guest profile; follow/count persistence; artist music/posts; text post creation; missing user/artist states. |
| Collections and track links | All three album pages, Favorites, an empty playlist, track detail and the long title on track 12; missing collection/track states. |
| Player | One audio element; actual time advancement; album queue; rapid next across distinct MP3 sources; seek, mute, pause, repeat controls; saved source/time/mute restored paused after reload. |
| Dialogs | Date picker at 320 px in light theme; Tab/Shift+Tab wrapping; Escape and focus return; playlist input retains focus while editing; nested player menu closes independently. |
| Chats | Send a local message; create a group with a searched member; open it with Enter; member list and chat details; report link preselects the user. |
| Settings | Account, sessions, privacy, blocked accounts, appearance, playback and About render; theme/privacy/explicit-content changes save and survive reload; local demo reset returns to Home. |
| Premium and reporting | Local plan activation creates a receipt; Track report saves locally; reports do not claim to contact moderation. |
| Entry and ancillary routes | Three welcome steps, entry/login, required-field validation, registration form, local recovery inbox/reset form, Terms link, incomplete confirmation and 404/home recovery; read-only diagnostics returns Track/1. Credential replacement and legal consent were not repeated in this regression. |

No console errors or warnings were captured during these browser flows. This does not certify every backend error path or every browser engine.

## Automated verification

- `task ci:check`: TypeScript, ESLint, YAML, seed integrity and 47 tests pass.
- `task build:release`: API bundle audit passes without mock runtime or binary media.
- `task build:demo`, `task pages:package`, `task pages:smoke`: compile, verify and package 12 MP3s plus 14 images; all 26 HTTP GET/HEAD/hash/MIME checks and MP3 range checks pass.
- The PR pipeline must also pass its Windows/Linux checks and actual Docker release audit before deployment.

The demo continues to use local browser data. Email delivery, payments, moderation, scheduled publishing, chat notifications, crossfade and automatic recommendations are outside the published mock implementation. Real backend integration and physical-device checks remain separate acceptance work.
