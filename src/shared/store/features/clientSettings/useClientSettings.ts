import { useCallback,useEffect } from 'react';

import { clientSettingsApi,useGetClientSettingsQuery,usePatchClientSettingsMutation } from '@entities/ClientSettings/api/rtkApi';
import { store } from '@shared/store';
import { useAppDispatch,useAppSelector } from '@shared/store/hooks';

import { clearSettings,setSettings } from './clientSettingsSlice';

/**
 * Хук для работы с настройками клиента
 * Предоставляет доступ к настройкам из Redux store и методы для их обновления
 * Использует RTK Query для загрузки и обновления настроек
 */
export const useClientSettings = () => {
  const dispatch = useAppDispatch();
  const { settings } = useAppSelector((state) => state.clientSettings);
  const { isAuthenticated, sessionVersion } = useAppSelector(state => state.auth);
  
  // Используем RTK Query для загрузки настроек
  const { currentData: settingsData, isLoading, error: queryError } = useGetClientSettingsQuery(undefined, { skip: !isAuthenticated });
  const [patchMutation, { isLoading: isPatching, error: patchError }] = usePatchClientSettingsMutation();

  // Синхронизируем данные из RTK Query в Redux store
  useEffect(() => {
    if (settingsData && isAuthenticated && store.getState().auth.sessionVersion === sessionVersion) {
      dispatch(setSettings(settingsData));
    }
  }, [settingsData, isAuthenticated, sessionVersion, dispatch]);

  /**
   * Загружает настройки с сервера
   */
  const loadSettings = useCallback(async () => {
    const owner = store.getState().auth;
    if (!owner.isAuthenticated) return null;
    const result = await dispatch(clientSettingsApi.endpoints.getClientSettings.initiate(undefined, { subscribe: false, forceRefetch: true }));
    return owner.sessionVersion === store.getState().auth.sessionVersion ? result.data ?? null : null;
  }, [dispatch]);

  /**
   * Обновляет настройки частично
   */
  const patchSettings = useCallback(async (updates: Record<string, unknown>) => {
    const owner = store.getState().auth;
    if (!owner.isAuthenticated || owner.sessionVersion !== sessionVersion) return null;
    try {
      const result = await patchMutation(updates).unwrap();
      if (result && owner.sessionVersion === store.getState().auth.sessionVersion) {
        dispatch(setSettings(result));
        return result;
      }
      return null;
    } catch (err) {
      if (owner.sessionVersion !== store.getState().auth.sessionVersion) return null;
      console.error('Failed to update settings:', err);
      throw err;
    }
  }, [patchMutation, dispatch, sessionVersion]);

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

