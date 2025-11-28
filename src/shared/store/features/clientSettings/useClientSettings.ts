import { useCallback, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@shared/store/hooks';
import { setSettings, clearSettings } from './clientSettingsSlice';
import { useGetClientSettingsQuery, usePatchClientSettingsMutation } from '@shared/api';

/**
 * Хук для работы с настройками клиента
 * Предоставляет доступ к настройкам из Redux store и методы для их обновления
 * Использует RTK Query для загрузки и обновления настроек
 */
export const useClientSettings = () => {
  const dispatch = useAppDispatch();
  const { settings } = useAppSelector((state) => state.clientSettings);
  
  // Используем RTK Query для загрузки настроек
  const { data: settingsData, isLoading, error: queryError, refetch } = useGetClientSettingsQuery();
  const [patchMutation, { isLoading: isPatching, error: patchError }] = usePatchClientSettingsMutation();

  // Синхронизируем данные из RTK Query в Redux store
  useEffect(() => {
    if (settingsData) {
      dispatch(setSettings(settingsData));
    }
  }, [settingsData, dispatch]);

  /**
   * Загружает настройки с сервера
   */
  const loadSettings = useCallback(async () => {
    const result = await refetch();
    if (result.data) {
      return result.data;
    }
    return null;
  }, [refetch]);

  /**
   * Обновляет настройки частично
   */
  const patchSettings = useCallback(async (updates: Record<string, unknown>) => {
    try {
      const result = await patchMutation(updates).unwrap();
      if (result) {
        dispatch(setSettings(result));
        return result;
      }
      return null;
    } catch (err) {
      console.error('Failed to update settings:', err);
      return null;
    }
  }, [patchMutation, dispatch]);

  /**
   * Очищает настройки (вызывается при logout)
   */
  const clear = useCallback(() => {
    dispatch(clearSettings());
  }, [dispatch]);

  return {
    settings,
    isLoading: isLoading || isPatching,
    error: queryError || patchError,
    loadSettings,
    patchSettings,
    clear,
  };
};

