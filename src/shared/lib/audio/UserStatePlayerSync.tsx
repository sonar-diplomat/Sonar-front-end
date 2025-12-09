import { useEffect, useState } from 'react';
import { useGetQueueQuery } from '@entities/UserState/api/rtkApi';
import { usePlayer } from '@shared/store/features/player';
import { useQueuePersistence } from '@shared/lib';
import { usePlaybackSync } from '@shared/lib';

/**
 * Компонент для синхронизации userState.currentTrackId с player
 * Автоматически загружает и запускает трек когда изменяется currentTrackId
 */
export const UserStatePlayerSync = () => {
  const { restoreQueue, pause } = usePlayer();
  const [hasRestoredQueue, setHasRestoredQueue] = useState(false);

  useQueuePersistence();
  usePlaybackSync();

  const { data: queueData, isLoading, isError, error } = useGetQueueQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });

  useEffect(() => {
    if (hasRestoredQueue) {
      return;
    }

    if (isLoading) {
      console.log('[UserStatePlayerSync] Still loading queue data...');
      return;
    }

    if (isError) {
      console.error('[UserStatePlayerSync] Error loading queue:', error);
      setHasRestoredQueue(true);
      return;
    }

    console.log('[UserStatePlayerSync] Processing queue data:', {
      hasQueueData: queueData !== null && queueData !== undefined,
      queueData: queueData ? {
        hasTracks: !!queueData.Tracks,
        isTracksArray: Array.isArray(queueData.Tracks),
        tracksLength: queueData.Tracks?.length,
        currentTrackId: queueData.CurrentTrackId,
        collectionId: queueData.CollectionId,
        position: queueData.Position
      } : null,
    });

    if (queueData && queueData.Tracks && Array.isArray(queueData.Tracks) && queueData.Tracks.length > 0) {
      try {
        const currentIndex = queueData.CurrentTrackId
          ? queueData.Tracks.findIndex(t => t.id === queueData.CurrentTrackId)
          : 0;

        let currentTime = 0;
        if (queueData.Position) {
          try {
            const parts = queueData.Position.split(':');
            if (parts.length >= 3) {
              const hours = parseInt(parts[0], 10) || 0;
              const minutes = parseInt(parts[1], 10) || 0;
              const seconds = parseFloat(parts[2]) || 0;
              currentTime = hours * 3600 + minutes * 60 + seconds;
            }
          } catch (e) {
            console.warn('[UserStatePlayerSync] Failed to parse Position:', queueData.Position);
          }
        }

        let collectionContext: { type: 'playlist' | 'album' | 'blend'; id: number } | null = null;
        if (queueData.CollectionId) {
          collectionContext = {
            type: 'playlist',
            id: queueData.CollectionId
          };
        }

        restoreQueue({
          queue: queueData.Tracks,
          customQueue: [],
          queueIndex: Math.max(0, currentIndex),
          collectionContext,
          currentTime,
        });

        pause();

        console.log('[UserStatePlayerSync] Queue restored from backend:', {
          tracks: queueData.Tracks.length,
          currentIndex,
          currentTime,
          collectionContext
        });
        setHasRestoredQueue(true);
      } catch (error) {
        console.error('[UserStatePlayerSync] Failed to restore queue:', error);
        setHasRestoredQueue(true);
      }
    } else {
      console.log('[UserStatePlayerSync] No queue to restore (empty or null)');
      setHasRestoredQueue(true);
    }
  }, [queueData, isLoading, isError, hasRestoredQueue, restoreQueue, pause]);

  return null;
};


