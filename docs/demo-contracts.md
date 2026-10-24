# Demo contracts

## Build profiles

`VITE_DATA_SOURCE` accepts `api` or `mock`. Absence selects `api`; any other value fails configuration. `npm run build` checks TypeScript and builds API. `npm run build:demo` checks TypeScript and runs `vite build --mode demo` with `VITE_DATA_SOURCE=mock`. Both builds are optimized for production. Development mode, hostname, branch and tokens never select mocks.

`src/shared/config/data-source.ts` exports `dataSource` and `isDemoMode`. Mock runtime/dispatcher are imported dynamically behind `isDemoMode`. Vite aliases `@demo-runtime`, `@demo-dispatcher`, `@demo-seed`, `@demo-media` and the synchronous `@shared/demo/media` helper to their real implementations/JSON only in mock; API resolves inert modules in `src/shared/config/`. The specific media-helper alias precedes the general shared alias, so local binary-cache side effects cannot enter API chunks. Thus API builds with `demo/` absent and without LFS. Mock base defaults to `/Sonar-front-end/`, overridable using `VITE_BASE_PATH` (absolute pathname with trailing slash). API base defaults to `/`. Static URLs use `import.meta.env.BASE_URL`; mock uses hash routing and API retains browser routing.

## Seed, IDs and DTOs

`demo/data/seed.json` is deterministic, with `schemaVersion: 1`, `currentUserId: 1` and normalized domain records. The data layer defines/validates the complete `DemoSeed` schema. A minimal seed precedes catalog expansion. Load once during bootstrap before React, guards or queries; never overwrite persisted changes on renders. Endpoint DTOs follow `src/entities/**/model/` and API declarations. Backend DTOs/controllers are read-only references.

| Record | Stable IDs and relationships |
| --- | --- |
| Current user | `1`, owner of artist `1` for post scenarios |
| Users/artists | Users `1..5`; artists `1..4` belong to users `1..4` |
| Tracks/audio | `1..12`; audio file ID equals track ID |
| Albums/covers | Collection and cover IDs `101..103` |
| Playlists/covers | Collection and cover IDs `201..204` |
| Folders | `1` protected root; `2` child |
| Avatars | `301..305` for users `1..5` |
| Chats/covers | Chats `1..2`, covers `401..402` |
| Uploaded binaries | IDs start at `10000` |

Collection IDs are unique across types. All foreign keys resolve; every cover/audio ID exists in the manifest. Missing optional nested fields are handled explicitly.

## Dispatcher and adapters

`src/shared/demo/handlers.ts` exports `dispatchMock(request)`, asynchronously returning `{ success: boolean, status: number, message: string, data?: unknown, errors?: string[], details?: string[] }`. Request: `{ url: string, method?: string, params?: Record<string, unknown>, body?: unknown, signal?: AbortSignal }`; method defaults to GET. Normalize existing endpoint prefixes/query strings. Explicit handlers cover search/filter/sort/pagination, validation, not-found and ownership results. Empty lists are arrays. Unknown endpoints return diagnostic 404 with method/path and never use network fallback.

RTK Query maps success to `{ data, meta }`, failure to `{ error: { status, data: canonicalResult } }`. Legacy ApiClient returns `NormalizedApiResponse<T>` with the same envelope semantics. Blob/stream operations use media resolution. API transport behavior remains real. Mutations update one database, persist, emit change, invalidate shared `DemoState` query tags and synchronize dependent legacy stores. Tests inject seed/storage to avoid Vite aliases in Node.

## Session, persistence and reset

`src/shared/demo/runtime.ts` exports `bootstrapDemo(): Promise<void>` and `resetDemoState(): Promise<void>`. Bootstrap completes before render in mock. Guards, auth slices and `useCurrentUserId` see user `1` without fabricated JWTs, server login/refresh or Hub connections. Registration, recovery and subscription forms have explicit local outcomes without mail/payment calls.

Storage keys use `sonar-demo:` with a versioned `{ schemaVersion, seedVersion, state }` envelope. Incompatible versions reset predictably. Storage failure leaves usable memory state and communicates lost persistence. API credentials/unrelated keys are untouched. Favorites, library, playlists/folders, follows, settings, posts and chats persist. Player uses a separate namespaced key. Reset restores seed, clears only demo keys/uploads, revokes owned object URLs and clears relevant query/store/player caches.

Binary uploads use IndexedDB database `sonar-demo`, store `uploads`, IDs >=10000. Runtime exports `getUploadedMediaUrl(id): Promise<string | null>` plus a sync cached lookup after bootstrap. Runtime owns object URL lifetime. Do not encode uploads into localStorage.

Local authentication receipts use an outbox exposed by `getDemoOutbox()`: `{ id, kind, email, token, createdAt, usedAt? }`. The one-use demonstration token is `demo-token`; receipts are visibly local confirmation/recovery links. `enterDemoSession()` handles explicit demo entry. Bootstrap enters user1 on first launch; logout persists a null session until explicit entry/login or reset. Reset restores user1. Local login/registration validate identity and password digest without server tokens.

## Local chat events

Preserve typed payloads exported by `src/shared/lib/signalr/useSignalR.ts`. In mock, signalRManager/useSignalR use an in-process bus for message create/read/update/delete, chat name/cover/member/delete and typing. Mutations emit those payloads, and UI deduplicates messages by ID. No Hub object/connect/reconnect or refresh is invoked in mock. API keeps real SignalR loaded as needed.

## Media and publication

Manifest `demo/media-manifest.json`: `{ "schemaVersion": 1, "audio": [...], "images": [...] }`. Entries: `{ id: number, path: string, mime: string, bytes: number, sha256: string, licenseId: string }`; audio also has `durationSeconds: number`. Paths are relative to `demo/`, e.g. `audio/track-01.mp3`, `images/album-101.svg`. Reject absolute/traversal/remote CDN/LFS URLs. Images/JSON stay in ordinary Git. Scoped audio LFS attributes are configured before staging. `demo/licenses.json` records source, author, license, attribution and files with verifiable provenance.

`src/shared/demo/media.ts` resolves numeric IDs synchronously from compile-time `@demo-media` to `${BASE_URL}demo/${path}`, including cached uploads. API retains image/blob and audio streams. One HTMLAudioElement owns playback. Play starts after visitor input; direct static audio URLs support range requests/seek. No binary imports/base64 in JS/CSS.

`build:demo` compiles app/JSON without copying binary media. `media:pull` selectively obtains manifest audio; `media:verify` rejects pointers and checks bytes/MIME/hash/duration/licenses/relations. `pages:package` combines `dist/` and verified media in `.pages/` with `.nojekyll`. `pages:preview` serves the configured base over HTTP with range support. Media provides a Vite dev middleware; coordinator integrates it. API build/context/image exclude demo data/media.

Acceptance order: common type/lint/data/YAML/tests → demo build → selective pull → media verify → package → browser smoke → deploy → actual Pages URL/audio/seek/persistence. Prove delivery of one real MP3 before expanding remote media. Missing published verification is reported honestly. Maintainer-only settings stop dependent deployment; access/protection rules are never bypassed.

## File ownership

| Owner | Files |
| --- | --- |
| Coordinator | Git, package/lockfile, tsconfig/ESLint/Vite/env/build config, `src/env.d.ts`, profile selection/stubs under `src/shared/config/`, root README, `docs/README.md`, `development.md`, `build-profiles.md`, this contract, `troubleshooting.md` |
| Data/API | `demo/data/**`, `src/shared/demo/**` except media/types, `src/shared/api/**`, auth/SignalR libraries, metadata entity API/DTO/stores except `entities/Music/api/api.ts`, auth/clientSettings/userState slices, `src/main.tsx`, features API/model, `docs/demo-data.md` |
| UI/player | `src/app/**`, pages/widgets/shared UI, UI hooks, `src/features/**/ui/**`, audio library, image-utils, player slice, `entities/Music/api/api.ts`, `shared/demo/media.ts` and media types, `docs/demo-ui-audit.md`, `demo-playback.md` |
| Media/CI | `demo/audio/**`, images/manifest/licenses/demo README, attributes/ignore/Docker/workflows, `Taskfile.yaml`, `tasks/**`, `scripts/**`, `docs/media-storage.md`, `tasks.md`, `ci-cd.md` |

All paths in this table are repository-relative; abbreviated src areas are under `src/`. The coordinator also owns `tests/build-profiles.test.mjs`. Data/API owns remaining shared stores except player/notification UI, shared types and user-library hooks. UI owns chat embeds, Markdown/profile/favorites helpers and the notification store. Another owner's files require an explicit handoff. Dependencies and global config go through the coordinator. Legacy workflows stay manual-only with deploy jobs disabled. Task YAML commands are used locally and by CI.
