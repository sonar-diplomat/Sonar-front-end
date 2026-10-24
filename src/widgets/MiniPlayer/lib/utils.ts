import type { TrackDTO } from '@entities/Music';
export const formatTime = (seconds: number): string => {
    if (!Number.isFinite(seconds) || seconds < 0) return '00:00';
    return `${Math.floor(seconds / 60).toString().padStart(2, '0')}:${Math.floor(seconds % 60).toString().padStart(2, '0')}`;
};
interface ArtistLabel {
    pseudonym?: string; name?: string; artistName?: string; firstName?: string; lastName?: string; userName?: string; username?: string;
    user?: { firstName?: string; lastName?: string; userName?: string; username?: string };
}
interface ArtistSource {
    artists?: ArtistLabel[]; albumArtists?: ArtistLabel[]; trackArtists?: ArtistLabel[];
    creator?: string | ArtistLabel; artist?: string; demoCredits?: TrackDTO['demoCredits'];
}
function label(artist: ArtistLabel): string | undefined {
    return artist.pseudonym || artist.artistName || artist.name ||
        (artist.user?.firstName ? `${artist.user.firstName} ${artist.user.lastName || ''}`.trim() : undefined) || artist.user?.userName || artist.user?.username ||
        (artist.firstName ? `${artist.firstName} ${artist.lastName || ''}`.trim() : undefined) || artist.userName || artist.username;
}
export const getArtistNames = (track?: ArtistSource | null): string => {
    if (!track) return 'Unknown artist';
    if (track.demoCredits) return track.demoCredits.artist;
    const names = (track.artists || track.albumArtists || track.trackArtists || []).map(label).filter(Boolean);
    return names.join(', ') || (typeof track.creator === 'string' ? track.creator : track.creator ? label(track.creator) : '') || track.artist || 'Unknown artist';
};
export const getCoverUrl = (track: { cover?: File }): string | undefined => track.cover ? URL.createObjectURL(track.cover) : undefined;
