/**
 * Formats time in seconds to MM:SS format
 */
export const formatTime = (seconds: number): string => {
  if (!isFinite(seconds) || seconds < 0) {
    return '00:00';
  }

  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);

  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

/**
 * Gets artist names from track data
 * Supports multiple possible artist data structures
 */
export const getArtistNames = (track: any): string => {
  if (!track) {
    return 'Unknown Artist';
  }

  const artists = track.artists || track.albumArtists || track.trackArtists;

  if (!artists || artists.length === 0) {
    if (track.creator) {
      if (typeof track.creator === 'string') return track.creator;
      if (track.creator.firstName && track.creator.lastName) {
        return `${track.creator.firstName} ${track.creator.lastName}`;
      }
      if (track.creator.userName || track.creator.username) {
        return track.creator.userName || track.creator.username;
      }
    }

    if (track.artist) {
      if (typeof track.artist === 'string') return track.artist;
    }

    return 'Unknown Artist';
  }

  const names = artists
    .map((artist: any) => {
      if (artist.pseudonym) return artist.pseudonym;
      if (artist.name) return artist.name;
      if (artist.user?.firstName && artist.user?.lastName) {
        return `${artist.user.firstName} ${artist.user.lastName}`;
      }
      if (artist.user?.userName || artist.user?.username) {
        return artist.user.userName || artist.user.username;
      }
      if (artist.firstName && artist.lastName) {
        return `${artist.firstName} ${artist.lastName}`;
      }
      if (artist.userName || artist.username) {
        return artist.userName || artist.username;
      }
      return null;
    })
    .filter(Boolean);

  return names.length > 0 ? names.join(', ') : 'Unknown Artist';
};

/**
 * Gets cover URL with fallback
 */
export const getCoverUrl = (track: { cover?: File }): string | undefined => {
  return track.cover ? URL.createObjectURL(track.cover) : undefined;
};