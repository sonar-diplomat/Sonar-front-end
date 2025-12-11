import { useEffect, useRef } from 'react';
import { usePlayer } from '@shared/store/features/player';
import { useUpdateListeningTargetMutation, useUpdateCurrentPositionMutation } from '@entities/UserState/api/rtkApi';

export const usePlaybackSync = () => {
  const { currentTrack, collectionContext, currentTime, isPlaying, isStockCollection } = usePlayer();
  const [updateListeningTarget] = useUpdateListeningTargetMutation();
  const [updatePosition] = useUpdateCurrentPositionMutation();

  const previousTrackIdRef = useRef<number | null>(null);
  const previousCollectionIdRef = useRef<number | null>(null);
  const positionSaveIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!currentTrack) {
      previousTrackIdRef.current = null;
      previousCollectionIdRef.current = null;
      return;
    }

    const trackId = currentTrack.id;
    const collectionId = (isStockCollection && collectionContext?.id) ? collectionContext.id : null;

    if (
      trackId !== previousTrackIdRef.current ||
      collectionId !== previousCollectionIdRef.current
    ) {
      console.log('[usePlaybackSync] Updating listening target:', { trackId, collectionId, isStockCollection });

      updateListeningTarget({ trackId, collectionId: collectionId || undefined })
        .unwrap()
        .then(() => {
          console.log('[usePlaybackSync] Listening target updated successfully');
        })
        .catch((error) => {
          console.error('[usePlaybackSync] Failed to update listening target:', error);
        });

      previousTrackIdRef.current = trackId;
      previousCollectionIdRef.current = collectionId;
    }
  }, [currentTrack, collectionContext, isStockCollection, updateListeningTarget]);

  useEffect(() => {
    if (positionSaveIntervalRef.current) {
      clearInterval(positionSaveIntervalRef.current);
      positionSaveIntervalRef.current = null;
    }

    if (!isPlaying || !currentTrack) {
      return;
    }

    positionSaveIntervalRef.current = setInterval(() => {
      if (currentTime > 0) {
        const hours = Math.floor(currentTime / 3600);
        const minutes = Math.floor((currentTime % 3600) / 60);
        const seconds = currentTime % 60;
        const timeSpanString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toFixed(6).padStart(9, '0')}`;

        updatePosition(timeSpanString)
          .unwrap()
          .then(() => {
            console.log('[usePlaybackSync] Position updated:', timeSpanString);
          })
          .catch((error) => {
            console.error('[usePlaybackSync] Failed to update position:', error);
          });
      }
    }, 5000);

    return () => {
      if (positionSaveIntervalRef.current) {
        clearInterval(positionSaveIntervalRef.current);
      }
    };
  }, [isPlaying, currentTrack, currentTime, updatePosition]);

  useEffect(() => {
    return () => {
      if (currentTrack && currentTime > 0) {
        const hours = Math.floor(currentTime / 3600);
        const minutes = Math.floor((currentTime % 3600) / 60);
        const seconds = currentTime % 60;
        const timeSpanString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toFixed(6).padStart(9, '0')}`;

        updatePosition(timeSpanString)
          .unwrap()
          .then(() => {
            console.log('[usePlaybackSync] Final position saved:', timeSpanString);
          })
          .catch((error) => {
            console.error('[usePlaybackSync] Failed to save final position:', error);
          });
      }
    };
  }, []);
};

