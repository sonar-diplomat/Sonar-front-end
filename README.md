# Sonar frontend

Music discovery, playlists, profiles and chats built with React, TypeScript and Vite.

Use Node.js 24.14.x and install dependencies from the lockfile:

```sh
npm ci
npm run dev
```

The default profile uses a real API. Copy `.env.example` to `.env.local` and set the API/media URLs for that environment. For local demo data, use `npm run dev:demo`; media setup and publication are described in the [documentation](docs/README.md).

```sh
npm run typecheck
npm run lint
npm run build       # API production build
npm run build:demo  # mock production build; binary media packaged separately
```

See [development](docs/development.md), [build profiles](docs/build-profiles.md), [media storage](docs/media-storage.md), [CI and Pages](docs/ci-cd.md), and [troubleshooting](docs/troubleshooting.md). Legacy server deployment workflows are retained and disabled.

[Design reference](https://www.figma.com/design/y6WFucowySMk5rhaixVl3k/Sonar-Final-Project--Ui-Design?node-id=38-95)
