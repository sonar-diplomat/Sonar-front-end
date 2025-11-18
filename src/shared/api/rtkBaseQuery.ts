import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { API_BASE_URL } from '@shared/config';
import { authManager } from '@shared/lib/auth/auth-manager';
import { shouldRefreshToken } from '@shared/lib/auth/jwt-utils';
import { normalizeResponse, type ApiResponse } from '@shared/types/api';

// Расширяем FetchArgs для поддержки наших опций
interface CustomFetchArgs extends FetchArgs {
  withAuth?: boolean;
  timeoutMs?: number;
  retries?: number;
}

// Тип ошибки для RTK Query
type CustomFetchBaseQueryError = FetchBaseQueryError & {
  data?: {
    success: false;
    status: number;
    message: string;
    errors?: string[];
    details?: string[];
  };
};

import { toSearchParams } from './params-utils';

/**
 * Кастомный baseQuery с поддержкой специфики API
 */
export const rtkBaseQuery: BaseQueryFn<
  CustomFetchArgs,
  unknown,
  CustomFetchBaseQueryError
> = async (args) => {
  const {
    url,
    method = 'GET',
    withAuth = true,
    timeoutMs = 15000,
    retries = 0,
    params,
    headers: restHeaders,
    ...rest
  } = args as CustomFetchArgs;

  // Построение URL с параметрами
  let fullUrl = `${API_BASE_URL}${url}`;
  if (params) {
    const qs = toSearchParams(params).toString();
    if (qs) fullUrl += `?${qs}`;
  }

  // Подготовка headers
  const headers: Record<string, string> = {};

  // Авторизация
  if (withAuth) {
    const accessToken = authManager.getAccessToken();
    const refreshToken = authManager.getRefreshToken();

    // Проверка и обновление токена перед запросом
    if (accessToken && shouldRefreshToken(accessToken) && refreshToken) {
      await authManager.refreshAccessToken();
    } else if (!accessToken && refreshToken) {
      await authManager.refreshAccessToken();
    } else if (!accessToken && !refreshToken) {
      await authManager.autoLogin();
    }

    const token = authManager.getAccessToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  // Объединяем headers
  const finalHeaders: HeadersInit = {
    ...headers,
    ...(restHeaders as Record<string, string>),
  };

  // Выполнение запроса с retry логикой
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    if (attempt > 0) {
      // Задержка перед retry (экспоненциальная)
      const delay = 300 * Math.pow(2, attempt - 1);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

      const response = await fetch(fullUrl, {
        method,
        headers: finalHeaders,
        signal: controller.signal,
        ...rest,
      });

      clearTimeout(timeoutId);

      const status = response.status;
      const contentType = response.headers.get('content-type') || '';

      // Обработка 401 с автоматическим refresh
      if (status === 401 && withAuth) {
        const refreshed = await authManager.refreshAccessToken();
        if (refreshed) {
          // Повторяем запрос с новым токеном
          const newToken = authManager.getAccessToken();
          if (newToken) {
            headers['Authorization'] = `Bearer ${newToken}`;
            continue; // Retry запрос
          }
        } else {
          // Пытаемся auto-login
          const loginSuccess = await authManager.autoLogin();
          if (loginSuccess) {
            const newToken = authManager.getAccessToken();
            if (newToken) {
              headers['Authorization'] = `Bearer ${newToken}`;
              continue; // Retry запрос
            }
          }
        }
      }

      // Обработка не-JSON ответов (204, файлы и т.д.)
      if (status === 204 || !contentType.includes('application/json')) {
        const text = await response.text().catch(() => '');

        if (!response.ok) {
          return {
            error: {
              status: status,
              data: {
                success: false,
                status,
                message: text || response.statusText || `HTTP ${status}`,
                errors: [text || response.statusText || `HTTP ${status}`],
              },
            } as CustomFetchBaseQueryError,
          };
        }

        return { data: text || 'OK' };
      }

      // Обработка JSON ответов
      let raw: ApiResponse<unknown>;
      try {
        raw = await response.json();
      } catch {
        return {
          error: {
            status: status,
            data: {
              success: false,
              status,
              message: 'Invalid JSON response',
              errors: ['Invalid JSON response'],
            },
          } as CustomFetchBaseQueryError,
        };
      }

      // Нормализация ответа (как в apiClient)
      const normalized = normalizeResponse(raw, status);

      // Проверка на ошибку
      if (!response.ok || normalized.success === false) {
        return {
          error: {
            status: normalized.status,
            data: {
              success: false,
              status: normalized.status,
              message: normalized.message || response.statusText || `HTTP ${status}`,
              errors: normalized.errors ?? normalized.details ?? [normalized.message || `HTTP ${status}`],
              details: normalized.details,
            },
          } as CustomFetchBaseQueryError,
        };
      }

      // Успешный ответ - извлекаем data и обрабатываем "empty list"
      let data = normalized.data;
      
      // Обработка "empty list" для пустых коллекций
      if (data === 'empty list') {
        data = [];
      }

      return {
        data,
        meta: {
          success: normalized.success,
          status: normalized.status,
          message: normalized.message,
          errors: normalized.errors,
          details: normalized.details,
        },
      };
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Network error');

      // Если это последняя попытка, возвращаем ошибку
      if (attempt === retries) {
        return {
          error: {
            status: 0,
            data: {
              success: false,
              status: 0,
              message: lastError.message,
              errors: [lastError.message],
            },
          } as CustomFetchBaseQueryError,
        };
      }
    }
  }

  // Не должно сюда дойти, но на всякий случай
  return {
    error: {
      status: 0,
      data: {
        success: false,
        status: 0,
        message: lastError?.message || 'Unknown error',
        errors: [lastError?.message || 'Unknown error'],
      },
    } as CustomFetchBaseQueryError,
  };
};

