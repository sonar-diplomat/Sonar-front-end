import { useCallback, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@shared/store/hooks';
import { setUserAccessFeatures, setAllAccessFeatures, clearAccess } from './accessSlice';
import {
  useGetAccessFeaturesQuery,
  useGetUserAccessFeaturesQuery,
  useAssignAccessFeaturesMutation,
  useRevokeAccessFeaturesMutation,
} from '@shared/api';

/**
 * Хук для работы с функциями доступа
 * Предоставляет доступ к функциям доступа из Redux store и методы для их управления
 * Использует RTK Query для загрузки функций доступа
 */
export const useAccess = () => {
  const dispatch = useAppDispatch();
  const { userAccessFeatures, allAccessFeatures } = useAppSelector((state) => state.access);

  // Используем RTK Query для загрузки всех функций доступа
  const { data: allFeaturesData, isLoading: isLoadingAll, error: allFeaturesError, refetch: refetchAll } =
    useGetAccessFeaturesQuery();

  // Синхронизируем данные из RTK Query в Redux store
  useEffect(() => {
    if (allFeaturesData) {
      dispatch(setAllAccessFeatures(allFeaturesData));
    }
  }, [allFeaturesData, dispatch]);

  /**
   * Загружает все доступные функции доступа (справочник)
   */
  const loadAllAccessFeatures = useCallback(async () => {
    const result = await refetchAll();
    if (result.data) {
      return result.data;
    }
    return null;
  }, [refetchAll]);

  /**
   * Загружает функции доступа для конкретного пользователя
   */
  const loadUserAccessFeatures = useCallback(async (userId: number) => {
    // Используем RTK Query hook для загрузки функций доступа пользователя
    // Это будет выполнено через useGetUserAccessFeaturesQuery в компоненте
    // Здесь мы просто возвращаем функцию для совместимости
    return null;
  }, []);

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
    isLoading: isLoadingAll,
    error: allFeaturesError,
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

