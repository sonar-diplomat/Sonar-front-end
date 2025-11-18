import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@shared/store/hooks';
import { setCurrentPosition, setListeningTarget, setStatus, setLoading, clearUserState } from './userStateSlice';
import { Api } from '@entities/UserState/api/api';
import { withAuth } from '@shared/lib/auth/withAuth';
import type { RequestConfig } from '@shared/types';

const pickError = (res: any) =>
  res?.success ? undefined : res?.errors?.[0] || res?.details?.[0] || res?.message;

/**
 * Хук для работы с состоянием пользователя
 * Предоставляет доступ к состоянию из Redux store и методы для его обновления
 */
export const useUserState = () => {
  const dispatch = useAppDispatch();
  const { currentPosition, currentTrackId, currentCollectionId, statusId, isLoading } = useAppSelector(
    (state) => state.userState
  );

  /**
   * Обновляет текущую позицию воспроизведения
   */
  const updateCurrentPosition = useCallback(async (position: string, cfg?: RequestConfig) => {
    dispatch(setLoading(true));
    
    try {
      const res = await withAuth(() => Api.updateCurrentPosition(position, cfg));
      
      if (res.success) {
        dispatch(setCurrentPosition(position));
        return true;
      } else {
        const errorMessage = pickError(res) || 'Failed to update position';
        console.error(errorMessage);
        return false;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update position';
      console.error(errorMessage);
      return false;
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch]);

  /**
   * Обновляет текущий трек и коллекцию
   */
  const updateListeningTarget = useCallback(async (trackId: number, collectionId?: number, cfg?: RequestConfig) => {
    dispatch(setLoading(true));
    
    try {
      const res = await withAuth(() => Api.updateListeningTarget(trackId, collectionId, cfg));
      
      if (res.success) {
        dispatch(setListeningTarget({ trackId, collectionId }));
        return true;
      } else {
        const errorMessage = pickError(res) || 'Failed to update listening target';
        console.error(errorMessage);
        return false;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update listening target';
      console.error(errorMessage);
      return false;
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch]);

  /**
   * Обновляет статус пользователя
   */
  const updateStatus = useCallback(async (statusId: number, cfg?: RequestConfig) => {
    dispatch(setLoading(true));
    
    try {
      const res = await withAuth(() => Api.updateStatus(statusId, cfg));
      
      if (res.success) {
        dispatch(setStatus(statusId));
        return true;
      } else {
        const errorMessage = pickError(res) || 'Failed to update status';
        console.error(errorMessage);
        return false;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update status';
      console.error(errorMessage);
      return false;
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch]);

  /**
   * Добавляет трек в очередь
   */
  const addToQueue = useCallback(async (cfg?: RequestConfig) => {
    dispatch(setLoading(true));
    
    try {
      const res = await withAuth(() => Api.addToQueue(cfg));
      return res.success;
    } catch (err) {
      console.error('Failed to add to queue:', err);
      return false;
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch]);

  /**
   * Удаляет трек из очереди
   */
  const deleteFromQueue = useCallback(async (cfg?: RequestConfig) => {
    dispatch(setLoading(true));
    
    try {
      const res = await withAuth(() => Api.deleteFromQueue(cfg));
      return res.success;
    } catch (err) {
      console.error('Failed to delete from queue:', err);
      return false;
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch]);

  /**
   * Обновляет основную сессию пользователя
   */
  const updatePrimarySession = useCallback(async (cfg?: RequestConfig) => {
    dispatch(setLoading(true));
    
    try {
      const res = await withAuth(() => Api.updatePrimarySession(cfg));
      return res.success;
    } catch (err) {
      console.error('Failed to update primary session:', err);
      return false;
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch]);

  /**
   * Очищает состояние пользователя (вызывается при logout)
   */
  const clear = useCallback(() => {
    dispatch(clearUserState());
  }, [dispatch]);

  return {
    currentPosition,
    currentTrackId,
    currentCollectionId,
    statusId,
    isLoading,
    updateCurrentPosition,
    updateListeningTarget,
    updateStatus,
    addToQueue,
    deleteFromQueue,
    updatePrimarySession,
    clear,
  };
};

