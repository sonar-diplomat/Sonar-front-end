import { useEffect,useRef } from 'react';

import { useSaveQueueMutation } from '@entities/UserState/api/rtkApi';
import { store } from '@shared/store';
import { usePlayer } from '@shared/store/features/player';
import { useAppSelector } from '@shared/store/hooks';

export const useQueuePersistence = () => {
  const { isAuthenticated, sessionVersion } = useAppSelector((state) => state.auth);
  const { queue } = usePlayer();
  const [saveQueueApi] = useSaveQueueMutation();

  const previousQueueRef = useRef<typeof queue>([]);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    const queueIds = queue.map(t => t.id);
    const previousIds = previousQueueRef.current.map(t => t.id);

    if (JSON.stringify(queueIds) === JSON.stringify(previousIds)) {
      return;
    }

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      const owner = store.getState().auth;
      if (!owner.isAuthenticated || owner.sessionVersion !== sessionVersion) return;
      if (queueIds.length > 0) {
        saveQueueApi(queueIds)
          .unwrap()
          .then(() => {})
          .catch((error) => {
            if (store.getState().auth.sessionVersion === sessionVersion) console.error('[useQueuePersistence] Failed to save queue to backend:', error);
          });
      }

      previousQueueRef.current = queue;
    }, 500);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [queue, saveQueueApi, isAuthenticated, sessionVersion]);
};

