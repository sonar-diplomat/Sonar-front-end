# Demo data and transport

The `mock` profile runs every metadata operation against one browser-local database. `api` keeps the real HTTP and SignalR transports. Profile selection and packaging are described in [demo-contracts.md](demo-contracts.md) and [build-profiles.md](build-profiles.md).

## Files and ownership of state

| File | Purpose |
| --- | --- |
| `demo/data/seed.json` | Authoritative deterministic seed, schema 1; normalized records and stable foreign keys |
| `src/shared/demo/database.ts` | DTO-based storage schema, validation, constants |
| `src/shared/demo/transport.ts` | Serialized dispatcher, request normalization, atomic mutations, scenarios |
| `src/shared/demo/catalog.ts` | Tracks, albums, playlists, folders, search, recommendations, sharing |
| `src/shared/demo/social.ts` | Users, follows, access features, artist posts, chats and events |
| `src/shared/demo/accounts.ts` | Local sessions, registration/recovery outbox, settings and queue |
| `src/shared/demo/administration.ts` | Subscription receipts, gifts, reports and distributor operations |
| `src/shared/demo/persistence.ts` | Versioned JSON storage and memory-only fallback |
| `src/shared/demo/blobs.ts` | IndexedDB uploads and owned object URL lifetime |
| `src/shared/demo/handlers.ts` | Browser singleton; injected seed, storage, QR encoder and media callbacks |
| `src/shared/demo/runtime.ts` | Bootstrap, Redux projections, cache invalidation, session/reset helpers |
| `src/shared/api/rtkBaseQuery.ts`, `oldBaseApi.ts` | Adapters; mock dispatch occurs before network/auth/retry logic |
| `src/shared/api/legacyQuery.ts` | Imperative compatibility hooks reuse RTK endpoints instead of deleted legacy getters |
| `src/shared/api/requestFetch.ts` | API request deadline combined with caller/RTK cancellation; streamed bodies keep their abort signal |

Transport reads return detached DTOs. Mutations run sequentially against a copy, validate relations, commit once, persist, and emit events. Failed validation/ownership checks leave the database unchanged. Redux and query caches are projections, never another persistent catalog. Seed loading occurs once before React renders; a component render does not reload seed.

Before each operation the transport reloads the latest persisted snapshot. Runtime serializes tabs with Web Locks (`sonar-demo:state`), including mutations that await binary storage or password hashing. Storage events refresh other tabs and invalidate their projections without persisting again. A concurrent change detected before commit returns `409 MOCK_CONFLICT_RETRY` instead of overwriting newer data; this also protects browsers without Web Locks, where the visitor may need to retry a simultaneous action. Uploads use IndexedDB `add` so an existing binary ID is never overwritten. Player preferences remain a separate per-browser view owned by the player layer.

## IDs, DTOs and media

Seed includes 5 users, 4 fictional artists, 12 tracks, 3 albums, 4 playlists, 2 folders, 4 posts, 2 chats and sample messages. Subscription/distributor dictionaries and settings are present; visitor payments, reports and gifts start empty.

| Entity | IDs / relation |
| --- | --- |
| Users and artists | Users 1–5; artists 1–4 belong to users 1–4; current user 1 owns artist 1 |
| Tracks | 1–12; `artistIds` and `albumId` are normalized foreign keys |
| Audio files | Initially equal to track ID for each requested quality; all qualities resolve the same licensed recording |
| Albums | 101–103; each contains four tracks; covers 101–103 |
| Playlists | 201 Favorites, 202 Evening Drive, 203 Quiet Focus, 204 Weekend Friends; matching cover IDs |
| Folders | 1 protected Root, 2 For later; collection IDs are globally unique across album/playlist types |
| Avatars / chats | Avatars 301–305; chats 1–2, covers 401–402 |
| Visitor entities/uploads | Monotonic shared sequence starting at 10000; reset restores sequence |

Storage records extend application DTOs only with normalized links, ownership and bookkeeping. `trackView`, `albumView`, `playlistView`, `folderView` and profile/message projections construct endpoint responses. Favorites is the protected playlist for each user; `Track.isFavorite` derives from its membership. Folder summaries derive names/covers from the current collection records. Duplicate add/follow operations are idempotent.

Subscription responses normalize the server's `features` field and the legacy `subscriptionFeatures` field to one feature list. Queue responses normalize Pascal/camel field names while preserving track IDs and zero position/order values. These boundary adapters apply in API mode as well, without introducing a second persistent store.

Real recordings are by Kevin MacLeod, separate from fictional Sonar profiles. Track `demoCredits` carries original title, artist, exact source and license URLs. Media paths, measured durations, hashes and licenses are in `demo/media-manifest.json` and `demo/licenses.json`; see [media-storage.md](media-storage.md). Add an entity by editing seed DTO fields and foreign keys, reserving unique IDs, adding every media ID to the manifest, and running data/media verification. Never put binary bytes or data URLs in seed.

Current media checkpoint: the catalog contains 12 metadata records, while the manifest contains one measured recording. Tracks 2–12 still require their manifest entries, verified bytes and measured durations. Their current seed durations are provisional. Complete media/seed relation verification must remain failing until all 12 recordings are available; this checkpoint is not a complete playable catalog.

## Request behavior

Both adapters use `dispatchMock({ url, method?, params?, body?, signal? })`. Relative paths, `/api/` prefixes, absolute legacy URLs and query strings normalize to the same path. FormData fields normalize their leading capital, so `Name` and `name` use the same operation. JSON and raw string bodies remain compatible with the existing APIs.

Success is `{ success: true, status: 200, message, data? }`; lists are real arrays. RTK extracts `data`, while ApiClient preserves the envelope. Failures include `errors` and diagnostic `details` containing an error code and method/path. Unknown endpoints return `404 MOCK_ENDPOINT_NOT_FOUND` and never retry or contact the server. Other results include 400 invalid input/cursor, 401 signed-out session, 403 ownership/privacy, 404 missing record, 409 conflicting action, 499 cancellation and 503 explicit error scenario. Binary storage errors fail the upload instead of reporting a successful server write.

| Domain | Read behavior | Mutations and validation |
| --- | --- | --- |
| Search | General/category results; case-insensitive title/name/related artist/album matching; `limit` 1–100, nonnegative `offset`, total before slicing; `sort`/`sortBy`, `order`/`sortOrder`; track `artistId`, `albumId`, `genreId`, `isExplicit` filters; suggestions/popular queries | Unknown category or invalid bounds returns 400 |
| Track / album | Full DTO, credits, derived artists, visibility, album tracks | Metadata, visibility, audio/cover uploads, album create/delete/add; author checks; deleting releases cleans playlist/queue/recent links |
| Playlist | Full DTO and `items/after/next/nextCursor/limit/hasMore` pages; `after` is last track ID | CRUD, contributors, tracks/import, cover/visibility; owner/contributor checks; protected Favorites cannot be renamed/deleted |
| Folder / library | Own folders with current collection summaries and child counts | CRUD, add/remove/move collection, move folder; cycle prevention; deleting a folder reparents contents; protected root stays intact |
| Recommendations | Popular collection scores; recent track/collection cursor pages | Listening updates counts and recency; cursor is the last returned timestamp/entity token |
| User / artist / posts | Profiles, public playlists, top tracks/artists, followers/following, friends, artist posts | Profile/avatar, follows, artist registration/name, post create/edit/delete/visibility; owner checks |
| Chat | Membership-filtered list/info; messages newest first, cursor is last message ID; sender/read DTOs | Create/name/cover/member/leave/delete; message send/edit/delete/read; reply and membership checks; local events |
| Client settings | Settings and language/theme/quality dictionaries | Validated partial updates, nested privacy and blocked-user IDs; unknown fields return 400 |
| Auth / sessions | Current local session list and outbox | Registration, one-use confirmation/recovery, local password digests, revoke; no mail or server tokens |
| UserState | Normalized Pascal/camel legacy queue response | Queue append/remove/save, listening target, TimeSpan position, status/session activity |
| Subscription / gift | Plans/features, local payment history, gift dictionaries and own gifts | `amount` is the supplied payment amount; gift send creates a sender receipt, recipient acceptance reuses it, recipient cancellation removes the pending gift/receipt; no payment service |
| Report / distributor | Report filters/dictionaries; distributor accounts/requests | Local CRUD, close/resolve, distributor credentials and session operations; no remote moderation or license issuance |
| Share / binary | Hash URLs under configured base, real local SVG QR, manifest or cached upload | Unknown media returns a local error; only known static/blob media may use `fetch` |

There is no seeded Blend collection. Existing Blend operations return a clear missing-record response for nonexistent IDs. Post attachments require an existing supported local file reference; the current text-post UI does not upload arbitrary attachments. Local 2FA is disabled because demo accounts have no second factor. No email, charge, cross-browser synchronization or server-side moderation takes place.

## Session, persistence and reset

`main.tsx` waits for `bootstrapDemo()` before rendering guards or requests. First boot selects user 1, without a fabricated JWT. `useCurrentUserId` uses the explicit demo identity. Login and refresh adapters bypass server code, and SignalR uses the local event bus. The API profile continues to load real credentials and use real transports.

Explicit entry uses `enterDemoSession()`. Seed login is `demo@example.test` (or `demo`) / `demo-password`. New registrations store only SHA-256 demonstration password digests, confirm their local email, then log in with their chosen identity. These local credentials are demonstration state, not a production authentication boundary. `leaveDemoSession()` persists a null session; reload does not silently log back in. `resetDemoState()` restores seed user 1.

`getDemoOutbox()` returns `{ id, kind, email, token, createdAt, usedAt? }` receipts. Token `demo-token` is checked with email and operation kind and consumed once. Requesting a replacement consumes prior unused receipts of that kind. Registration/recovery UI shows local completion links. Subscription actions append inspectable local payment DTOs.

`sonar-demo:state` stores `{ schemaVersion: 1, seedVersion: "1.0.0", state }`. Schema/seed version mismatch or corrupt/invalid state restores seed predictably; bootstrap also clears incompatible uploads. Storage full/blocked leaves memory usable and exposes `{ persistent: false, reason }` through `getDemoStatus()` so UI can warn that reload loses changes. API credential/settings keys and unrelated localStorage entries are untouched.

IndexedDB database `sonar-demo`, version 1, store `uploads`, holds `{ id, blob }`. Bootstrap hydrates owned object URLs before synchronous media resolution. `getUploadedMediaUrl(id)` and `getCachedUploadedMediaUrl(id)` expose asynchronous and cached lookup. Reset runs behind queued mutations, clears demo uploads, revokes owned URLs, removes other `sonar-demo:` keys (including player state), restores seed and resets RTK/search/library/userState/auth/settings projections. UI consumes `sonar-demo:reset` to clear the active player. A failed upload never falls back to the server.

Cancelled or conflicting mutations delete only the new binary IDs they created, allowing a clean retry without leaving a file that occupies the next sequence ID.

All query declarations carry `DemoState`, including lazy-injected endpoints. Successful metadata mutations invalidate it and synchronize dependent store projections. Queue changes invalidate Queue; position-only updates avoid refetching the catalog. Local event names/payloads match `useSignalR.ts`: `message.created/read/updated/deleted`, `chat.name.updated`, `chat.cover.updated`, `chat.user.added/removed`, `chat.deleted` and `Typing`.

## Checks and explicit scenarios

Run `npm run typecheck`, `npm run lint` and `npm run test:demo`. With Node 24, pure data tests also run as `node --experimental-strip-types --test --test-isolation=none src/shared/demo/transport.test.ts`. Tests inject seed/storage/clock and never require Vite aliases, a Hub or the old server.

Tests cover seed relations, detached snapshots, related-artist search, total/offset/cursor/sort errors, CRUD/library coherence, favorites, follows/settings, transaction rollback, typed chat events, registration/confirmation/recovery, receipts, binary callbacks, concurrent IDs, reload, reset, incompatible/corrupt storage, quota fallback, abort and unknown endpoints with a throwing network spy.

Regression tests also use two transports sharing one storage: playlist/favorite edits survive progress writes from the other tab; a shared asynchronous lock prevents upload/ID races; an unlocked conflict produces a retriable error. SignalR has only type imports on startup; the real package loads inside API connection construction.

`src/shared/demo/cancellation.test.ts` exercises the real legacy/RTK server adapter code with controlled fetch responses. It checks pre-aborted requests, external cancellation, deadlines and timer cleanup, cancellation after headers while reading a streamed body, JSON/text parsing and absence of retries after caller abort. `requestFetch` uses native `AbortSignal.any` to preserve cancellation without an extra manually retained event listener; API adapters report cancellation as 499 instead of an invalid JSON response.

`createMockTransport({ seed, scenario: "empty" })` empties catalog/posts/chats while preserving the current account and protected library. `scenario: "error"` returns deterministic 503. These fixtures are injected for testing and are never mixed into the default catalog. Missing IDs, invalid cursor, forbidden owner, repeated token and failed binary storage are separate real errors.

Browser acceptance must additionally verify mutation→navigation→reload→reset, local confirmation/recovery links, playback uploads after reload, chat event deduplication, and no API/Hub/login/refresh requests. Static audio/image requests are expected. Both optimized profiles and absence of demo modules in API output are checked by the build/media workflow.

At the current compiled checkpoint, the two-tab regression also passed in a browser: a playlist created and renamed while another tab updated listening progress remained present after reload. Playback position restored paused. Application TypeScript, scoped data/API lint and all 31 data/cancellation regressions passed. The complete CI graph reaches media verification and stops at missing audio ID 2; this is an outstanding catalog requirement, not a passing full-demo acceptance result. Real browser upload/IndexedDB persistence and complete registration/recovery interactions remain separate acceptance evidence.

## Exact operation inventory

The following inventory is generated from the dispatcher registration. Parameters and return shapes are described above and in application endpoint DTOs.

| Path | Methods |
| --- | --- |
| `AccessFeature` | GET |
| `AccessFeature/:id` | GET |
| `AccessFeature/assign/:id` | POST |
| `AccessFeature/revoke/:id` | POST |
| `AccessFeature/user/:id` | GET |
| `Album` | GET, POST |
| `Album/:id` | GET, DELETE |
| `Album/:id/add` | POST |
| `Album/:id/cover` | PUT |
| `Album/:id/link` | GET |
| `Album/:id/name` | PUT |
| `Album/:id/qr` | GET |
| `Album/:id/share-link` | GET |
| `Album/:id/share-qr` | GET |
| `Album/:id/toggle-favorite` | POST |
| `Album/:id/tracks` | GET |
| `Album/:id/visibility` | PUT |
| `Artist` | DELETE, POST |
| `Artist/:id` | GET |
| `Artist/:id/link` | GET |
| `Artist/:id/posts` | GET |
| `Artist/:id/qr` | GET |
| `Artist/:id/share-link` | GET |
| `Artist/:id/share-qr` | GET |
| `Artist/:id/update-name` | PUT |
| `Artist/:id/visibility` | PUT |
| `Artist/post/:id` | DELETE, PUT |
| `Artist/register` | POST |
| `Auth/confirm-email` | POST |
| `Auth/confirm-email-change` | POST |
| `Auth/confirm-password-change` | POST |
| `Auth/forgot-password` | POST |
| `Auth/login` | POST |
| `Auth/refresh-token` | POST |
| `Auth/register` | POST |
| `Auth/request-email-change` | POST |
| `Auth/request-password-change` | POST |
| `Auth/reset-password` | POST |
| `Auth/sessions` | GET |
| `Auth/sessions/:id/revoke` | POST |
| `Auth/sessions/revoke-all` | POST |
| `Auth/verify-2fa` | POST |
| `AuthDistributor/:id/revoke` | POST |
| `AuthDistributor/login` | POST |
| `AuthDistributor/refresh-token` | POST |
| `AuthDistributor/register` | POST |
| `AuthDistributor/session/:id` | DELETE |
| `AuthDistributor/sessions` | GET |
| `AuthDistributor/sessions/revoke-all` | POST |
| `Blend/:id/link` | GET |
| `Blend/:id/qr` | GET |
| `Blend/:id/share-link` | GET |
| `Blend/:id/share-qr` | GET |
| `Blend/:id/toggle-favorite` | POST |
| `Blend/:id/visibility` | PUT |
| `Chat` | GET, POST |
| `Chat/:id` | DELETE |
| `Chat/:id/add/:userId` | POST |
| `Chat/:id/cover` | PUT |
| `Chat/:id/info` | GET |
| `Chat/:id/leave` | DELETE |
| `Chat/:id/messages` | GET |
| `Chat/:id/name` | PUT |
| `Chat/:id/read` | PUT |
| `Chat/:id/read-all` | PUT |
| `Chat/:id/remove/:userId` | DELETE |
| `Chat/:id/send` | POST |
| `Chat/:id/typing` | POST |
| `Chat/message/:id` | GET, PUT, DELETE |
| `ChatSticker` | GET |
| `ClientSettings` | GET, PATCH |
| `ClientSettings/languages` | GET |
| `ClientSettings/notification-types` | GET |
| `ClientSettings/playback-qualities` | GET |
| `ClientSettings/themes` | GET |
| `Demo/session` | POST, DELETE |
| `Distributor` | GET, POST |
| `Distributor/:id` | GET, PUT, DELETE |
| `Distributor/request` | GET |
| `Distributor/request/:id` | GET, POST |
| `Distributor/update-key/:id` | GET |
| `DistributorMaster/account/:id` | GET, DELETE |
| `DistributorMaster/account/:id/email` | PUT |
| `DistributorMaster/account/:id/password` | PUT |
| `DistributorMaster/account/:id/username` | PUT |
| `Folder` | GET, POST |
| `Folder/:id` | GET, DELETE |
| `Folder/:id/add-collection/:collectionId` | POST |
| `Folder/:id/move/:targetId` | PUT |
| `Folder/:id/remove-collection/:collectionId` | DELETE |
| `Folder/:id/update-name` | PUT |
| `Folder/move-collection/:collectionId/to-folder/:targetId` | PUT |
| `Gift/:id` | GET |
| `Gift/:id/accept` | POST |
| `Gift/:id/cancel` | DELETE |
| `Gift/received` | GET |
| `Gift/send` | POST |
| `Gift/sent` | GET |
| `Gift/styles` | GET |
| `Gift/styles/:id` | GET |
| `Playlist/:id` | GET, DELETE |
| `Playlist/:id/add-contributor/:userId` | POST |
| `Playlist/:id/add-track/:trackId` | POST |
| `Playlist/:id/delete-contributor/:userId` | DELETE |
| `Playlist/:id/import-collection/:type/:sourceId` | POST |
| `Playlist/:id/link` | GET |
| `Playlist/:id/qr` | GET |
| `Playlist/:id/remove-track/:trackId` | DELETE |
| `Playlist/:id/share-link` | GET |
| `Playlist/:id/share-qr` | GET |
| `Playlist/:id/toggle-favorite` | POST |
| `Playlist/:id/tracks` | GET |
| `Playlist/:id/update-cover` | PUT |
| `Playlist/:id/update-name` | PUT |
| `Playlist/:id/visibility` | PUT |
| `Playlist/create` | POST |
| `Playlist/is-favorite/:id` | GET |
| `Recommendations/popular-collections` | GET |
| `Recommendations/recent-collections` | GET |
| `Recommendations/recent-tracks` | GET |
| `Report` | GET, POST |
| `Report/:id` | GET, DELETE |
| `Report/:id/close` | PUT |
| `Report/entity-types` | GET |
| `Report/entity-types/:id` | GET |
| `Report/filter` | GET |
| `Report/open` | GET |
| `Report/reason-types` | GET |
| `Report/reason-types/:id` | GET |
| `Report/reason-types/by-entity-type/:id` | GET |
| `Report/reporter/:id` | GET |
| `Search` | GET |
| `Search/albums` | GET |
| `Search/artists` | GET |
| `Search/playlists` | GET |
| `Search/popular` | GET |
| `Search/suggestions` | GET |
| `Search/tracks` | GET |
| `Search/users` | GET |
| `Subscription/features` | GET |
| `Subscription/features/:id` | GET |
| `Subscription/packs` | GET |
| `Subscription/packs/:id` | GET |
| `Subscription/payments` | GET |
| `Subscription/payments/:id` | GET |
| `Subscription/purchase` | POST |
| `Track/:id` | GET, PUT, DELETE |
| `Track/:id/audio-file` | PUT |
| `Track/:id/link` | GET |
| `Track/:id/qr` | GET |
| `Track/:id/share-link` | GET |
| `Track/:id/share-qr` | GET |
| `Track/:id/toggle-favorite` | POST |
| `Track/:id/visibility` | PUT |
| `User` | GET |
| `User/:id` | GET |
| `User/:id/link` | GET |
| `User/:id/profile` | GET |
| `User/:id/qr` | GET |
| `User/:id/share-link` | GET |
| `User/:id/share-qr` | GET |
| `User/:id/visibility` | PUT |
| `User/friends` | GET |
| `User/friends/:id` | DELETE |
| `User/profile/:identifier` | GET |
| `User/top-artists` | GET |
| `User/top-tracks` | GET |
| `User/update` | PUT |
| `User/update-avatar` | POST |
| `UserFollow/:id/follow` | POST |
| `UserFollow/:id/followers` | GET |
| `UserFollow/:id/following` | GET |
| `UserFollow/:id/unfollow` | DELETE |
| `UserState/current-position` | PUT |
| `UserState/listening/:trackId` | PUT |
| `UserState/listening/:trackId/:collectionId` | PUT |
| `UserState/queue` | GET, POST, DELETE, PUT |
| `UserState/session` | PATCH |
| `UserState/status/:id` | PUT |

`blob/:id` and `Track/:id/stream` are handled by `downloadDemo` and the media resolver, outside metadata dispatch.
