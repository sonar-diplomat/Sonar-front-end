import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@shared/store/hooks';
import { setCurrentPosition, setListeningTarget, setStatus, clearUserState } from './userStateSlice';
import {
  useUpdateCurrentPositionMutation,
  useUpdateListeningTargetMutation,
  useUpdateUserStatusMutation,
  useAddToQueueMutation,
  useDeleteFromQueueMutation,
  useUpdatePrimarySessionMutation,
} from '@shared/api';

/**
 * Хук для работы с состоянием пользователя
 * Предоставляет доступ к состоянию из Redux store и методы для его обновления
 * Использует RTK Query mutations для обновления состояния
 */
export const useUserState = () => {
  const dispatch = useAppDispatch();
  const { currentPosition, currentTrackId, currentCollectionId, statusId } = useAppSelector(
    (state) => state.userState
  );

  const [updatePositionMutation, { isLoading: isUpdatingPosition }] = useUpdateCurrentPositionMutation();
  const [updateListeningMutation, { isLoading: isUpdatingListening }] = useUpdateListeningTargetMutation();
  const [updateStatusMutation, { isLoading: isUpdatingStatus }] = useUpdateUserStatusMutation();
  const [addToQueueMutation, { isLoading: isAddingToQueue }] = useAddToQueueMutation();
  const [deleteFromQueueMutation, { isLoading: isDeletingFromQueue }] = useDeleteFromQueueMutation();
  const [updatePrimarySessionMutation, { isLoading: isUpdatingSession }] = useUpdatePrimarySessionMutation();

  /**
   * Обновляет текущую позицию воспроизведения
   */
  const updateCurrentPosition = useCallback(async (position: string) => {
    try {
      await updatePositionMutation(position).unwrap();
      dispatch(setCurrentPosition(position));
      return true;
    } catch (err) {
      console.error('Failed to update position:', err);
      return false;
    }
  }, [updatePositionMutation, dispatch]);

  /**
   * Обновляет текущий трек и коллекцию
   */
  const updateListeningTarget = useCallback(async (trackId: number, collectionId?: number) => {
    try {
      await updateListeningMutation({ trackId, collectionId }).unwrap();
      dispatch(setListeningTarget({ trackId, collectionId }));
      return true;
    } catch (err) {
      console.error('Failed to update listening target:', err);
      return false;
    }
  }, [updateListeningMutation, dispatch]);

  /**
   * Обновляет статус пользователя
   */
  const updateStatus = useCallback(async (statusId: number) => {
    try {
      await updateStatusMutation(statusId).unwrap();
      dispatch(setStatus(statusId));
      return true;
    } catch (err) {
      console.error('Failed to update status:', err);
      return false;
    }
  }, [updateStatusMutation, dispatch]);

  /**
   * Добавляет трек в очередь
   */
  const addToQueue = useCallback(async (trackId: number) => {
    try {
      await addToQueueMutation(trackId).unwrap();
      return true;
    } catch (err) {
      console.error('Failed to add to queue:', err);
      return false;
    }
  }, [addToQueueMutation]);

  /**
   * Удаляет трек из очереди
   */
  const deleteFromQueue = useCallback(async (trackId: number) => {
    try {
      await deleteFromQueueMutation(trackId).unwrap();
      return true;
    } catch (err) {
      console.error('Failed to delete from queue:', err);
      return false;
    }
  }, [deleteFromQueueMutation]);

  /**
   * Обновляет основную сессию пользователя
   */
  const updatePrimarySession = useCallback(async () => {
    try {
      await updatePrimarySessionMutation().unwrap();
      return true;
    } catch (err) {
      console.error('Failed to update primary session:', err);
      return false;
    }
  }, [updatePrimarySessionMutation]);

  /**
   * Очищает состояние пользователя (вызывается при logout)
   */
  const clear = useCallback(() => {
    dispatch(clearUserState());
  }, [dispatch]);

  const isLoading =
    isUpdatingPosition ||
    isUpdatingListening ||
    isUpdatingStatus ||
    isAddingToQueue ||
    isDeletingFromQueue ||
    isUpdatingSession;

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

