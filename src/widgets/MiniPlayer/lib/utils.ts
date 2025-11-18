import { getImageUrl } from '@shared/lib/image-utils';

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
export const getArtistNames = (track: { 
  artists?: Array<{ user?: { firstName?: string; lastName?: string } }> | string[];
} | null): string => {
  if (!track) {
    return 'Unknown Artist';
  }
  
  // Support for string array (from TrackDTO)
  if (Array.isArray(track.artists) && track.artists.length > 0) {
    if (typeof track.artists[0] === 'string') {
      return (track.artists as string[]).join(', ');
    }
    
    // Support for object array (from full Track model)
    const names = (track.artists as Array<{ user?: { firstName?: string; lastName?: string } }>)
      .map(artist => {
        if (artist.user?.firstName && artist.user?.lastName) {
          return `${artist.user.firstName} ${artist.user.lastName}`;
        }
        return null;
      })
      .filter(Boolean);

    return names.length > 0 ? names.join(', ') : 'Unknown Artist';
  }
  
  return 'Unknown Artist';
};

/**
 * Gets cover URL with fallback
 * Supports:
 * - coverId (number) - converts to blob API URL
 * - cover.id (number) - converts to blob API URL
 * - coverUrl (string) - if it's a full URL returns as is, otherwise tries to parse as ID
 * - cover.url (string) - if it's a full URL returns as is, otherwise tries to parse as ID
 * - cover (File) - creates object URL
 */
export const getCoverUrl = (track: { 
  coverId?: number | null;
  cover?: File | { id?: number; url?: string } | null; 
  coverUrl?: string;
}): string | undefined => {
  // Priority: coverId > cover.id > coverUrl > cover.url > cover (File)
  if (track.coverId) {
    return getImageUrl(track.coverId);
  }
  
  if (track.cover) {
    if (typeof track.cover === 'object' && 'id' in track.cover && typeof track.cover.id === 'number') {
      return getImageUrl(track.cover.id);
    }
    if (typeof track.cover === 'object' && 'url' in track.cover && track.cover.url) {
      return getImageUrl(track.cover.url);
    }
    if (track.cover instanceof File) {
      return getImageUrl(track.cover);
    }
  }
  
  if (track.coverUrl) {
    return getImageUrl(track.coverUrl);
  }
  
  return undefined;
};