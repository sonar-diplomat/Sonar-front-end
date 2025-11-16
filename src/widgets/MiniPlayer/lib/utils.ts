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
 */
export const getArtistNames = (track: { artists?: Array<{ user?: { firstName?: string; lastName?: string } }> }): string => {
  if (!track || !track.artists || track.artists.length === 0) {
    return 'Unknown Artist';
  }
  const names = track.artists
    .map(artist => {
      if (artist.user?.firstName && artist.user?.lastName) {
        return `${artist.user.firstName} ${artist.user.lastName}`;
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