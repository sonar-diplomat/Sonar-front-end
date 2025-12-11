import { useEffect, useRef } from 'react';
import { usePlayer } from '@shared/store/features/player';
import { useSaveQueueMutation } from '@entities/UserState/api/rtkApi';

export const useQueuePersistence = () => {
  const { queue } = usePlayer();
  const [saveQueueApi] = useSaveQueueMutation();

  const previousQueueRef = useRef<typeof queue>([]);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const queueIds = queue.map(t => t.id);
    const previousIds = previousQueueRef.current.map(t => t.id);

    if (JSON.stringify(queueIds) === JSON.stringify(previousIds)) {
      return;
    }

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      if (queueIds.length > 0) {
        saveQueueApi(queueIds)
          .unwrap()
          .then(() => {})
          .catch((error) => {
            console.error('[useQueuePersistence] Failed to save queue to backend:', error);
          });
      }

      previousQueueRef.current = queue;
    }, 500);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [queue, saveQueueApi]);
};

