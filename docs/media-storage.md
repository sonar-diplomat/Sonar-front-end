# Demo media storage

The demo keeps music in Git LFS and small SVG covers, JSON metadata and licenses in ordinary Git. Production API builds do not fetch LFS or ship demo content. Read [build profiles](build-profiles.md), [tasks](tasks.md) and [CI/CD](ci-cd.md) before publishing.

## Tools and repository setup

Use Node 24.14.0 (`.nvmrc`), Task 3.50.0 and Git LFS. Task installation and archive checksums are in [tasks.md](tasks.md). The local first-file validation used Git LFS 3.7.1; upstream currently recommends the security release 3.8.1. Install a current Git LFS from [git-lfs.com](https://git-lfs.com/), then run:

```text
git lfs version
git lfs install --local
git check-attr filter -- demo/audio/1.mp3 demo/images/101.svg demo/media-manifest.json
```

Only the audio path should report `filter: lfs`. `.gitattributes` scopes supported MP3/WAV/OGG/FLAC/M4A files to `demo/audio/`. The current verifier intentionally accepts MP3 only; adding another format requires decoder/MIME tests. Never ignore tracked audio sources, run an LFS history migration, or rewrite old commits to introduce this catalogue.

SVG covers explicitly use LF line endings and raster covers disable text conversion. This keeps the measured image bytes/SHA-256 identical across Windows and Linux checkouts, including machines with `core.autocrlf` enabled.

## Clone with or without music

Ordinary cloning with an installed LFS filter downloads binaries. For API development and CI, skip the smudge step:

```powershell
$env:GIT_LFS_SKIP_SMUDGE = '1'
git clone https://github.com/sonar-diplomat/Sonar-front-end.git
Remove-Item Env:GIT_LFS_SKIP_SMUDGE
```

```sh
GIT_LFS_SKIP_SMUDGE=1 git clone https://github.com/sonar-diplomat/Sonar-front-end.git
```

Inside the selected checkout, install dependencies with `npm ci`. `task build:release` does not pull audio. For the full demo, after the published one-file probe has been accepted:

```text
task media:pull
task media:verify
```

Use `task media:pull TRACK_IDS=1` for one track, or `TRACK_IDS=1,2` for a subset. `MEDIA_REMOTE` defaults to `origin`. The script sends explicit `--include` paths and an empty `--exclude` to `git lfs pull`, preventing unrelated LFS sets from being fetched. Authentication/LFS quota failures stop the command; it does not silently download from another host.

The standalone delivery probe uses `TRACK_IDS=1 MEDIA_SKIP_SEED=1`. This verifies the real MP3, cover metadata, hashes and license links while the full seed is still being integrated. Normal media/data checks validate seed relationships; bypassing the seed is not full-demo acceptance.

## Source, licenses and manifest

`scripts/media-sources.json` lists twelve different compositions by Kevin MacLeod. The original author's [catalogue](https://incompetech.com/music/royalty-free/pieces.json), per-track pages and [license generator](https://incompetech.com/music/royalty-free/licenses/) identify the recordings and CC BY 4.0 terms. Audio bytes are redistributed unchanged. These recordings are not test signals. Fictional demo artist profiles do not replace the real music credits.

`demo/licenses.json` records each source page, author, ISRC, download URL, license, attribution, changes and covered files. CC BY 4.0 permits redistribution with the required credit, license link and change notice; see the [license](https://creativecommons.org/licenses/by/4.0/). `media-credits.html` and the license JSON accompany every package. Keep attribution reachable from the UI.

The fourteen small covers are original procedural SVG geometry from `scripts/create-demo-covers.mjs`, released under CC0 to the extent relevant rights exist. They contain no third-party artwork, photographs, external fonts or embedded resources. The generator is the reproducible source, and its SHA-256 output is recorded in the manifest.

Manifest schema version 1 has `audio` and `images` arrays. Every entry has a numeric ID, path relative to `demo/`, MIME, byte count, SHA-256 and license ID. Audio also records measured duration, audio-file ID, cover ID, real author/title and source URL. Paths such as `audio/1.mp3` become `${BASE_URL}demo/audio/1.mp3`; absolute paths, traversal and remote/CDN URLs are rejected.

`media:verify` reads real files, rejects pointers/symlinks, checks size/hash/MIME, parses MPEG audio streams and duration, rejects duplicate audio bytes, validates SVG safety and checks all license/cover/audio/seed credit relationships. `ci:data` validates metadata and domain foreign keys without downloading LFS. A manifest or green YAML parser alone does not establish playback or published delivery.

## Add or replace a song

1. Confirm redistribution rights on the original creator's page. Record a verifiable author, source, exact license and attribution; do not infer a license from an unofficial mirror.
2. Add a stable numeric ID and source metadata to `scripts/media-sources.json`. Agree its audio/cover/seed relationships before changing the data. For an existing recording, preserve the source bytes and filename history; a new version can use a new path.
3. Import explicitly with `node scripts/acquire-demo-media.mjs --ids=ID`. This maintenance command downloads once, measures the recording and writes manifest/license records. It reuses registered files only after verifying their previous hash, and refuses to overwrite an unregistered file. CI uses LFS instead of this importer.
4. Update the seed title, measured duration and real credit/source fields. Update the corresponding UI/DTO support if the media contract changes. For replacement, preserve old Git history and explicitly update the registration; the importer intentionally does not overwrite a registered recording automatically.
5. Run `task ci:data`, `task media:verify`, `npm run test:media`, `task build:demo`, `task pages:package` and `task pages:smoke`. Listen in a browser, seek, pause/resume and switch tracks. Confirm different recordings have different hashes and audible musical content.
6. Check attributes before staging. Review `git lfs ls-files` and the staged pointer with `git show :demo/audio/ID.mp3`; the working file must still contain MP3 bytes. Commit the attributes, pointer, manifest, license and seed together. Push normal Git and LFS through the repository's reviewed change process.

Do not overwrite a missing LFS object by automatically acquiring an upstream copy: an upstream file could have changed. Diagnose authentication, object availability and quota first. For a deliberate replacement, register the newly measured hash and credit changes in a reviewed commit.

## Packaging, Docker and limits

`build:demo` compiles application/JSON into `dist/`; it must not copy music. `pages:package` checks an audited mock profile and combines it with verified media into `.pages/`. MP3s remain independent static files; there are no MP3 imports or audio data URLs in JS/CSS. Development uses the Vite middleware; preview serves the packaged files, base path and HTTP ranges.

The catalogue budget is 128 MiB and the complete Pages artifact budget is 256 MiB, enforced by scripts. HEAD checks of the twelve original recordings totaled 85,079,551 bytes on 2026-10-23; only imported/verified entries count as present. The full catalogue is pending the published one-file probe. Local `.pages*`, `.media-cache`, `.cache`, `.tools`, `.task` and test output are ignored by Git and excluded from the server context.

GitHub documents that [LFS cannot be used with Pages](https://docs.github.com/en/repositories/working-with-files/managing-large-files/about-git-large-file-storage). Do not treat LFS/raw URLs as a CDN or publish pointers. The proposed transport extracts ordinary MP3 bytes, validates them and places them in a Pages artifact. It must first pass an actual one-MP3 publication experiment; local success is not proof of service availability. If it fails, report the observed limitation and stop full publication until a tested alternative is approved.

[Pages limits](https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits) currently include a 1 GB published site and soft 100 GB/month bandwidth limit. [LFS accounting](https://docs.github.com/en/billing/concepts/product-billing/git-lfs) also applies to storage and downloads; binary changes create new stored versions. Maintainer checks available quotas before expansion. Do not activate paid storage or change plans automatically.

## Verification status

The initial `Carefree` file is 6,566,713 bytes, measured at 205.113469 seconds, SHA-256 `8433b770a630d9b1594fd484442c677907ece899a4d149954cd2e74fd733e311`. The first `.pages-probe/` package passed local GET/HEAD/MIME/hash/206 range checks. Local Chromium playback and seeking were also observed. Actual published URL, deployment run, CDN headers and remote playback proof are still required before enabling the full catalogue.
