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
export const getArtistNames = (track: { artist?: { name?: string } }): string => {
  return track.artist?.name || 'Unknown Artist';
};

/**
 * Gets cover URL with fallback
 */
export const getCoverUrl = (track: { coverUrl?: string }): string | undefined => {
  return track.coverUrl;
};