import manifest from '@demo-media';

import { getCachedUploadedMediaUrl } from './blobs';

/** Manifest paths are relative to demo/, never to the current route. */
export function resolveDemoMediaPath(path: string): string | undefined {
    if (!path || path.startsWith('/') || path.includes('\\') || /[:?#]/.test(path) ||
        path.split('/').some(part => !part || part === '.' || part === '..')) return undefined;
    return `${import.meta.env.BASE_URL}demo/${path}`;
}
export function resolveDemoImageUrl(id: number): string | undefined {
    if (id >= 10000) return getCachedUploadedMediaUrl(id) ?? undefined;
    const entry = manifest.images.find(image => image.id === id);
    return entry && resolveDemoMediaPath(entry.path);
}
export function resolveDemoAudioUrl(trackId: number, audioFileId = trackId): string | undefined {
    if (audioFileId >= 10000) return getCachedUploadedMediaUrl(audioFileId) ?? undefined;
    const entry = manifest.audio.find(audio => audio.id === audioFileId);
    return entry && resolveDemoMediaPath(entry.path);
}
export function getDemoAudioDuration(audioFileId: number): number {
    const duration = manifest.audio.find(audio => audio.id === audioFileId)?.durationSeconds;
    return duration && Number.isFinite(duration) && duration > 0 ? duration : 0;
}
