interface ImportMetaEnv {
    readonly VITE_API_BASE_URL: string;
    readonly VITE_DATA_SOURCE: 'api' | 'mock';
    readonly VITE_BASE_PATH?: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}

declare module '@demo-seed' {
    const seed: unknown;
    export default seed;
}

declare module '@demo-media' {
    interface MediaEntry {
        id: number;
        path: string;
        mime: string;
        bytes: number;
        sha256: string;
        licenseId: string;
        durationSeconds?: number;
    }
    const manifest: { schemaVersion: number; audio: MediaEntry[]; images: MediaEntry[] };
    export default manifest;
}
