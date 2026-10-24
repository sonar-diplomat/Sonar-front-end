# Sonar documentation

Start with [development](development.md) for installation and local execution, then [build profiles](build-profiles.md) for the API/demo boundary.

| Guide | Purpose |
| --- | --- |
| [Development](development.md) | Runtime, installation, commands and contribution checks |
| [Build profiles](build-profiles.md) | Mode selection, routing, artifacts and server isolation |
| [Demo contracts](demo-contracts.md) | DTO/ID, transport, persistence, events and media contracts |
| [Demo data](demo-data.md) | Seed, endpoints, mutations, local session and reset |
| [Playback](demo-playback.md) | Audio controller, queue, seek and error handling |
| [UI audit](demo-ui-audit.md) | Route/scenario coverage and remaining limitations |
| [Media storage](media-storage.md) | Licensing, LFS, manifests, verification and new content |
| [Task commands](tasks.md) | Task YAML and reusable local/CI operations |
| [CI and Pages](ci-cd.md) | Workflow triggers, publication, Maintainer setup and rollback |
| [Troubleshooting](troubleshooting.md) | Build, transport, media, Docker and publication diagnosis |
| [Verification record](verification.md) | Measured local results and remaining publication gates |

Demo changes are local to one browser. They are not synchronized between visitors. Mail, payment and backend realtime operations use explicit local demo scenarios.
