# Demo playback

## Architecture

The app root mounts one `AudioPlayerController` outside route content. Micro, Mini and Macro views dispatch to the same Redux player slice. The controller subscribes synchronously, allowing a visitor click to set the mock source and invoke `HTMLMediaElement.play()` inside the gesture. Route navigation leaves that element mounted.

Mock sources use `shared/demo/media.ts`, the compile-time `@demo-media` manifest and `import.meta.env.BASE_URL`. Existing numeric cover/audio DTO IDs resolve to `BASE_URL + demo/ + entry.path`. Paths must be relative, with no traversal, backslashes, remote scheme or query fragment. Binary media are static assets, never JS imports. Uploaded demo blobs use the shared IndexedDB URL cache. API builds replace demo boundaries with empty modules and retain authenticated streams and blob images.

The element uses `preload=auto`; it does not create a second playing element. Source changes increment a generation and signal cancellation; stale responses cannot start playback. Owned API object URLs are released after replacement or unmount. Full API HTTP cancellation depends on forwarding the supplied signal in the shared transport; this integration remains listed in the audit. Unknown/non-finite duration is zero, and seek is disabled until metadata arrives. Static seek depends on host byte-range support.

`isPlaying` is intent. Actual playing, waiting, metadata and error events update UI status. Rejected `play()` clears playing intent and shows a retry message. Sound begins after visitor interaction. Reload restores paused; it never auto-starts sound. Manual next ignores repeat-one, while natural completion applies repeat-one/all/off. Each queue occurrence has its own ID, including duplicate songs. Shuffle preserves the active occurrence and keeps later additions/removals when restoring original order.

Demo restore stores IDs, position and controls in the schema/seed-versioned `sonar-demo:player:v1` envelope. Rehydration reads current DTOs through ApiClient and cannot replace a newer visitor selection. Demo reset removes this namespace and clears the queue while preserving canonical favorites until seed state reloads. The player key is a last-writer preference; cross-tab audio ownership is not implemented. API restores continue through user-state queue/position endpoints.

`usePlaybackSync` writes listening target and position through ApiClient in both profiles using a stable five-second timer and store subscription. Demo-only restore, outbox and storage-status components use explicit build boundaries so API bundles discard them.

## Verification

Use build, media verification, packaging and preview commands from `docs/build-profiles.md` and `docs/tasks.md`. Open the preview under `/Sonar-front-end/`, never `file://`. Repeat against the actual published Pages URL.

1. Search a catalog song, open its album, click Play.
2. Inspect actual media: exactly one element, nonempty static currentSrc, readyState at least 2, finite positive duration, paused false and advancing currentTime. Repeat for a different MP3 URL.
3. Pause/resume, pointer and keyboard seek, previous/next, mute/volume, repeat modes, shuffle, duplicate queue add/remove. Rapidly change tracks and force a missing source to check stale-request guards and retry feedback.
4. Navigate library/profile/search while playing. Save favorite and add to a playlist. Reload the deep URL and confirm paused queue/position restore. Rename/delete an owned playlist; reset and confirm the seed and home destination.
5. Check route error/empty/loading states, chats, posts, settings and local forms. Check desktop and narrow-width overflow, fixed-panel occlusion, focus/labels and application-origin console diagnostics.
6. Verify a physical mobile browser and touch seek when available. Viewport emulation is a separate layout check.

Focused player regression command:

```sh
node --experimental-strip-types --test src/shared/store/features/player/playerSlice.test.ts
```

Application types:

```sh
npx tsc -p tsconfig.app.json --noEmit
```

## Results and limitations

`docs/demo-ui-audit.md` records exact evidence and pending regressions. A stable compiled preview has loaded the actual ID 1 MP3, advanced its time, sought, repeated and restored it paused after deep-link reload. Navigation retained one active element. Favorites, playlist creation, chat send/edit/delete, post creation, theme persistence and local reset were exercised. Several corrections found by that smoke await the frozen-source rebuild.

Only audio ID 1 is currently available. Distinct-track playback, complete final `.pages/` smoke and published Pages behavior are pending the release/media gate. Physical mobile playback is unverified. Actual media element evidence is required; Redux state alone is insufficient to claim playback. Audio output loudness was not independently measured.

Demo has no real email, payment, moderation or account deletion. Supported local actions are labelled, with recovery/confirmation links in the local outbox. Actual recording/license credits are displayed independently of fictional catalog artist profiles. Source failures show playback feedback; unavailable media must not be replaced by a success message.
