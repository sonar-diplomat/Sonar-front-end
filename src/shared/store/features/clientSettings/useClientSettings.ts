import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@shared/store/hooks';
import { setSettings, updateSettings, setLoading, setError, clearSettings } from './clientSettingsSlice';
import { Api } from '@entities/ClientSettings/api/api';
import { withAuth } from '@shared/lib/auth/withAuth';
import type { Settings } from '@entities/ClientSettings';
import type { RequestConfig } from '@shared/types';

const pickError = (res: any) =>
  res?.success ? undefined : res?.errors?.[0] || res?.details?.[0] || res?.message;

/**
 * Хук для работы с настройками клиента
 * Предоставляет доступ к настройкам из Redux store и методы для их обновления
 */
export const useClientSettings = () => {
  const dispatch = useAppDispatch();
  const { settings, isLoading, error } = useAppSelector((state) => state.clientSettings);

  /**
   * Загружает настройки с сервера
   */
  const loadSettings = useCallback(async (cfg?: RequestConfig) => {
    dispatch(setLoading(true));
    dispatch(setError(null));
    
    try {
      const res = await withAuth(() => Api.get(cfg));
      
      if (res.success && res.data) {
        dispatch(setSettings(res.data));
        return res.data;
      } else {
        const errorMessage = pickError(res) || 'Failed to load settings';
        dispatch(setError(errorMessage));
        return null;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load settings';
      dispatch(setError(errorMessage));
      return null;
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch]);

  /**
   * Обновляет настройки частично
   */
  const patchSettings = useCallback(async (updates: Record<string, unknown>, cfg?: RequestConfig) => {
    dispatch(setLoading(true));
    dispatch(setError(null));
    
    try {
      const res = await withAuth(() => Api.patch(updates, cfg));
      
      if (res.success && res.data) {
        dispatch(setSettings(res.data));
        return res.data;
      } else {
        const errorMessage = pickError(res) || 'Failed to update settings';
        dispatch(setError(errorMessage));
        return null;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update settings';
      dispatch(setError(errorMessage));
      return null;
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch]);

  /**
   * Очищает настройки (вызывается при logout)
   */
  const clear = useCallback(() => {
    dispatch(clearSettings());
  }, [dispatch]);

  return {
    settings,
    isLoading,
    error,
    loadSettings,
    patchSettings,
    clear,
  };
};

