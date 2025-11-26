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
  bodyType?: 'json' | 'raw';
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
    body,
    bodyType = 'json',
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
    let accessToken = authManager.getAccessToken();
    const refreshToken = authManager.getRefreshToken();

    if (import.meta.env.DEV) {
      console.log('[rtkBaseQuery] Auth check for:', url, {
        hasAccessToken: !!accessToken,
        hasRefreshToken: !!refreshToken,
        isAuthenticated: authManager.isAuthenticated(),
      });
    }

    // Проверка и обновление токена перед запросом
    if (accessToken && shouldRefreshToken(accessToken) && refreshToken) {
      if (import.meta.env.DEV) {
        console.log('[rtkBaseQuery] Access token needs refresh, refreshing...');
      }
      const refreshed = await authManager.refreshAccessToken();
      if (refreshed) {
        accessToken = refreshed;
      }
    } else if (!accessToken && refreshToken) {
      if (import.meta.env.DEV) {
        console.log('[rtkBaseQuery] No access token, but refresh token exists, refreshing...');
      }
      const refreshed = await authManager.refreshAccessToken();
      if (refreshed) {
        accessToken = refreshed;
      }
    } else if (!accessToken && !refreshToken) {
      if (import.meta.env.DEV) {
        console.log('[rtkBaseQuery] No tokens available, attempting auto-login...');
      }
      const loginSuccess = await authManager.autoLogin();
      if (loginSuccess) {
        accessToken = authManager.getAccessToken();
        if (import.meta.env.DEV) {
          console.log('[rtkBaseQuery] Auto-login successful, got access token');
        }
      } else {
        if (import.meta.env.DEV) {
          console.warn('[rtkBaseQuery] ⚠️ Требуется новый логин - auto-login не удался');
        }
      }
    }

    // Устанавливаем токен в headers
    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
      if (import.meta.env.DEV) {
        console.log('[rtkBaseQuery] Authorization header set for:', url);
      }
    } else {
      console.warn('[rtkBaseQuery] ⚠️ No access token available for authenticated request:', url);
      console.warn('[rtkBaseQuery] ⚠️ Требуется новый логин - токен не получен');
    }
  }

  // Выполнение запроса с retry логикой
  // Для запросов с авторизацией добавляем дополнительную попытку для retry при 401
  const maxAttempts = withAuth ? retries + 2 : retries + 1; // +1 для первоначального запроса, +1 для 401 retry
  let lastError: Error | null = null;
  let hasRetried401 = false; // Флаг, чтобы не зациклиться на 401

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    if (attempt > 0) {
      // Задержка перед retry (экспоненциальная)
      const delay = 300 * Math.pow(2, attempt - 1);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }

    try {
      // Обработка body в зависимости от bodyType
      let bodyToSend: BodyInit | undefined;
      if (body !== undefined) {
        if (bodyType === 'raw' && typeof body === 'string') {
          bodyToSend = body;
        } else {
          bodyToSend = JSON.stringify(body);
          // Устанавливаем Content-Type только для JSON body
          if (!headers['Content-Type']) {
            headers['Content-Type'] = 'application/json';
          }
        }
      }

      // Объединяем headers на каждой итерации (на случай обновления токена)
      const finalHeaders: HeadersInit = {
        ...headers,
        ...(restHeaders as Record<string, string>),
      };

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

      // Логирование для отладки (можно удалить позже)
      if (withAuth && import.meta.env.DEV) {
        console.log('[rtkBaseQuery] Request:', {
          url: fullUrl,
          method,
          hasAuth: !!finalHeaders['Authorization'],
          authHeader: finalHeaders['Authorization'] ? `${finalHeaders['Authorization'].substring(0, 20)}...` : 'none',
        });
      }

      const response = await fetch(fullUrl, {
        method,
        headers: finalHeaders,
        body: bodyToSend,
        signal: controller.signal,
        ...rest,
      });

      clearTimeout(timeoutId);

      const status = response.status;
      const contentType = response.headers.get('content-type') || '';

      // Обработка 401 с автоматическим refresh (только один раз)
      if (status === 401 && withAuth && !hasRetried401) {
        hasRetried401 = true;
        if (import.meta.env.DEV) {
          console.warn('[rtkBaseQuery] Received 401, attempting token refresh...');
        }
        const refreshed = await authManager.refreshAccessToken();
        if (refreshed) {
          // Повторяем запрос с новым токеном
          const newToken = authManager.getAccessToken();
          if (newToken) {
            headers['Authorization'] = `Bearer ${newToken}`;
            if (import.meta.env.DEV) {
              console.log('[rtkBaseQuery] Token refreshed, retrying request...');
            }
            continue; // Retry запрос
          }
        } else {
          // Пытаемся auto-login
          if (import.meta.env.DEV) {
            console.log('[rtkBaseQuery] Token refresh failed, attempting auto-login...');
          }
          const loginSuccess = await authManager.autoLogin();
          if (loginSuccess) {
            const newToken = authManager.getAccessToken();
            if (newToken) {
              headers['Authorization'] = `Bearer ${newToken}`;
              if (import.meta.env.DEV) {
                console.log('[rtkBaseQuery] Auto-login successful, retrying request...');
              }
              continue; // Retry запрос
            }
          } else {
            if (import.meta.env.DEV) {
              console.error('[rtkBaseQuery] ⚠️ Требуется новый логин - не удалось обновить токен или выполнить auto-login');
            }
          }
        }
        // Если refresh не удался, продолжаем обработку ошибки ниже
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

