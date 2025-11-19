import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@shared/store/hooks';
import { setUserAccessFeatures, setAllAccessFeatures, setLoading, setError, clearAccess } from './accessSlice';
import { Api } from '@entities/Access/api/api';
import { withAuth } from '@shared/lib/auth/withAuth';

const pickError = (res: any) =>
  res?.success ? undefined : res?.errors?.[0] || res?.details?.[0] || res?.message;

/**
 * Хук для работы с функциями доступа
 * Предоставляет доступ к функциям доступа из Redux store и методы для их управления
 */
export const useAccess = () => {
  const dispatch = useAppDispatch();
  const { userAccessFeatures, allAccessFeatures, isLoading, error } = useAppSelector((state) => state.access);

  /**
   * Загружает все доступные функции доступа (справочник)
   */
  const loadAllAccessFeatures = useCallback(async () => {
    dispatch(setLoading(true));
    dispatch(setError(null));
    
    try {
      const res = await Api.list();
      
      if (res.success && res.data) {
        dispatch(setAllAccessFeatures(res.data));
        return res.data;
      } else {
        const errorMessage = pickError(res) || 'Failed to load access features';
        dispatch(setError(errorMessage));
        return null;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load access features';
      dispatch(setError(errorMessage));
      return null;
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch]);

  /**
   * Загружает функции доступа для конкретного пользователя
   */
  const loadUserAccessFeatures = useCallback(async (userId: number) => {
    dispatch(setLoading(true));
    dispatch(setError(null));
    
    try {
      const res = await withAuth(() => Api.byUserId(userId));
      
      if (res.success && res.data) {
        dispatch(setUserAccessFeatures(res.data));
        return res.data;
      } else {
        const errorMessage = pickError(res) || 'Failed to load user access features';
        dispatch(setError(errorMessage));
        return null;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load user access features';
      dispatch(setError(errorMessage));
      return null;
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch]);

  /**
   * Проверяет, есть ли у пользователя указанная функция доступа
   */
  const hasAccessFeature = useCallback((featureName: string): boolean => {
    return userAccessFeatures.some(feature => feature.name === featureName);
  }, [userAccessFeatures]);

  /**
   * Очищает функции доступа (вызывается при logout)
   */
  const clear = useCallback(() => {
    dispatch(clearAccess());
  }, [dispatch]);

  return {
    userAccessFeatures,
    allAccessFeatures,
    isLoading,
    error,
    loadAllAccessFeatures,
    loadUserAccessFeatures,
    hasAccessFeature,
    clear,
  };
};

/**
 * Хук для получения функций доступа текущего пользователя
 * Использует селектор для проверки доступа
 */
export const useUserAccessFeatures = () => {
  const { userAccessFeatures } = useAppSelector((state) => state.access);
  
  const hasAccessFeature = useCallback((featureName: string): boolean => {
    return userAccessFeatures.some(feature => feature.name === featureName);
  }, [userAccessFeatures]);

  return {
    userAccessFeatures,
    hasAccessFeature,
  };
};

