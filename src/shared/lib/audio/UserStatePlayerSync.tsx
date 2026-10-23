import React,{ lazy, Suspense, useEffect,useState } from 'react';

import { useGetQueueQuery } from '@entities/UserState/api/rtkApi';
import { isDemoMode } from '@shared/config/data-source';
import { usePlaybackSync,useQueuePersistence } from '@shared/lib';
import { usePlayer } from '@shared/store/features/player';
import { useAppSelector } from '@shared/store/hooks';


/**
 * Компонент для синхронизации userState.currentTrackId с player
 * Автоматически загружает и запускает трек когда изменяется currentTrackId
 */
const DemoSync = isDemoMode ? lazy(() => import('@shared/lib/audio/DemoPlayerSync').then(module => ({ default: module.DemoPlayerSync }))) : null;
export const UserStatePlayerSync = () => { usePlaybackSync(); return DemoSync ? <Suspense fallback={null}><DemoSync /></Suspense> : <ApiPlayerSync />; };
const ApiPlayerSync = () => {
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const { restoreQueue, pause } = usePlayer();
  const [hasRestoredQueue, setHasRestoredQueue] = useState(false);

  useQueuePersistence();


  const { data: queueData, isLoading, isError, error } = useGetQueueQuery(undefined, {
    skip: !isAuthenticated,
  });

  useEffect(() => {
    if (!isAuthenticated || (!queueData && !isError)) return;
    if (hasRestoredQueue) {
      return;
    }

    if (isLoading) {
      return;
    }

    if (isError) {
      console.error('[UserStatePlayerSync] Error loading queue:', error);
      setHasRestoredQueue(true);
      return;
    }

    if (queueData && queueData.QueueTracks && Array.isArray(queueData.QueueTracks) && queueData.QueueTracks.length > 0) {
      try {
        const sortedQueueTracks = [...queueData.QueueTracks].sort((a, b) => a.Order - b.Order);
        const tracks = sortedQueueTracks.map(qt => qt.Track);

        const currentIndex = queueData.CurrentTrackId
          ? tracks.findIndex(t => t.id === queueData.CurrentTrackId)
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
          } catch {
            console.warn('[UserStatePlayerSync] Failed to parse Position:', queueData.Position);
          }
        }

        const hasManualTracks = sortedQueueTracks.some(qt => qt.IsManuallyAdded);
        const isStockCollection = !!queueData.CollectionId && !hasManualTracks;

        let collectionContext: { type: 'playlist' | 'album' | 'blend'; id: number } | null = null;
        if (queueData.CollectionId) {
          collectionContext = {
            type: 'playlist',
            id: queueData.CollectionId
          };
        }

        let queueToRestore: typeof tracks;
        let customQueueToRestore: typeof tracks = [];
        let indexToRestore: number;

        if (isStockCollection) {
          queueToRestore = tracks;
          indexToRestore = Math.max(0, currentIndex);
        } else {
          if (currentIndex >= 0 && currentIndex < tracks.length) {
            queueToRestore = tracks.slice(currentIndex);
            customQueueToRestore = queueToRestore.filter((_, idx) =>
              sortedQueueTracks[currentIndex + idx].IsManuallyAdded
            );
            indexToRestore = 0;
          } else {
            queueToRestore = tracks;
            customQueueToRestore = tracks.filter((_, idx) =>
              sortedQueueTracks[idx].IsManuallyAdded
            );
            indexToRestore = 0;
          }
        }

        restoreQueue({
          queue: queueToRestore,
          customQueue: customQueueToRestore,
          queueIndex: indexToRestore,
          collectionContext,
          currentTime,
          isStockCollection,
        });

        pause();

        setHasRestoredQueue(true);
      } catch (error) {
        console.error('[UserStatePlayerSync] Failed to restore queue:', error);
        setHasRestoredQueue(true);
      }
    } else {
      setHasRestoredQueue(true);
    }
  }, [queueData, isLoading, isError, hasRestoredQueue, restoreQueue, pause]);

  return null;
};
