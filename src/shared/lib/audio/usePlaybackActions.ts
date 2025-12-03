import { useCallback } from 'react';
import { usePlayer } from '@shared/store/features/player';
import type { TrackDTO } from '@entities/Music';

export type CollectionType = 'Playlist' | 'Album' | 'Blend';

export const usePlayTrack = () => {
  const { playTrack } = usePlayer();

  return useCallback(
    (track: TrackDTO) => {
      playTrack(track);
    },
    [playTrack]
  );
};

export const usePlayCollection = () => {
  const { setQueue } = usePlayer();

  return useCallback(
    async (collectionType: CollectionType, collectionId: number, startIndex = 0) => {
      try {
        const response = await fetch(`/api/${collectionType}/${collectionId}/tracks`);
        const data = await response.json();

        if (data?.items && Array.isArray(data.items)) {
          setQueue(data.items, startIndex);
        }
      } catch (error) {
        console.error(`Error loading ${collectionType.toLowerCase()} tracks:`, error);
      }
    },
    [setQueue]
  );
};

export const useAddToQueue = () => {
  const { addToQueue } = usePlayer();

  return useCallback(
    (track: TrackDTO) => {
      addToQueue(track);
    },
    [addToQueue]
  );
};

export const usePlayTracks = () => {
  const { setQueue } = usePlayer();

  return useCallback(
    (tracks: TrackDTO[], startIndex = 0, collectionContext?: { type: 'playlist' | 'album' | 'blend'; id: number }) => {
      setQueue(tracks, startIndex, collectionContext);
    },
    [setQueue]
  );
};
