// src/shared/api/oldBaseApi.ts
import { API_BASE_URL,MEDIA_BASE_URL } from '@shared/config';
import { isDemoMode } from '@shared/config/data-source';
import { authManager } from '@shared/lib/auth/auth-manager';
import type {
ApiResponse,
ClientOptions,
NormalizedApiResponse,
RequestConfig,
} from '@shared/types/api';
import { normalizeResponse } from '@shared/types/api';

import { toSearchParams } from './params-utils';
import {requestFetch} from './requestFetch';

/**
 * Проверяет, является ли endpoint медиа-контентом (blob или stream)
 */
const isMediaEndpoint = (endpoint: string): boolean => {
    return endpoint.includes('/blob/') || endpoint.includes('/stream');
};

class ApiClient {
    private readonly baseURL: string;
    private opts: ClientOptions;

    constructor(baseURL: string = API_BASE_URL, opts: ClientOptions = { retries: 0}) {
        this.baseURL = baseURL;
        this.opts = {
            retryDelayMs: opts.retryDelayMs ?? ((a) => 300 * 2 ** (a - 1)),
            ...opts,
        };
    }

    private buildURL(endpoint: string, params?: RequestConfig['params']) {
        // Используем MEDIA_BASE_URL для blob и stream endpoints
        const baseUrl = isMediaEndpoint(endpoint) ? MEDIA_BASE_URL : this.baseURL;
        const base = `${baseUrl}${endpoint}`;
        const qs = toSearchParams(params).toString();
        return qs ? `${base}?${qs}` : base;
    }

    private makeHeaders(withAuth: boolean, bodyType: RequestConfig['bodyType'], extra?: HeadersInit) {
        const authHeader =
            withAuth && this.opts.getToken?.() ? { Authorization: `Bearer ${this.opts.getToken()}` } : {};
        const jsonHeader = bodyType === 'json' ? { 'Content-Type': 'application/json' } : {};
        return {
            ...jsonHeader,
            ...authHeader,
            ...extra,
        } as HeadersInit;
    }

    private normalizeFailure<T>(
        status: number,
        message: string
    ): NormalizedApiResponse<T> {
        return {
            success: false,
            status,
            message,
            errors: [message],
            details: undefined,
        };
    }

    private async request<T>(
        endpoint: string,
        cfg: RequestConfig = {},
        attempt = 1,
        authRetried = false
    ): Promise<NormalizedApiResponse<T>> {
        if (isDemoMode) {
            const { dispatchMock } = await import('@demo-dispatcher');
            return await dispatchMock({ url: endpoint, method: cfg.method, params: cfg.params, body: cfg.body, signal: cfg.signal ?? undefined }) as NormalizedApiResponse<T>;
        }
        const {
            params,
            withAuth = true,
            timeoutMs = 15000,
            bodyType = 'json',
            ...fetchCfg
        } = cfg;

        const url = this.buildURL(endpoint, params);



        const headers = this.makeHeaders(withAuth, bodyType, fetchCfg.headers);

        try {
            const resp = await requestFetch(url, { ...fetchCfg, headers }, timeoutMs);

            const status = resp.status;
            const ct = resp.headers.get('content-type') || '';
            const hasJson = status !== 204 && ct.includes('application/json');

            // Handle 401 with single onUnauthorized replay
            if (status === 401 && this.opts.onUnauthorized && withAuth && !authRetried) {
                await this.opts.onUnauthorized();
                return this.request<T>(endpoint, cfg, attempt, true);
            }

            if (!hasJson) {

                const text = await resp.text().catch(error => { if(cfg.signal?.aborted) throw error; return ''; });
                if (!resp.ok) {
                    return this.normalizeFailure<T>(
                        status,
                        text || resp.statusText || `HTTP ${status}`
                    );
                }
                return { success: true, status, message: text || 'OK' };
            }

            let raw: ApiResponse<T>;
            try {
                raw = await resp.json();
            } catch (error) {
                if(cfg.signal?.aborted) throw error;
                return this.normalizeFailure(status, 'Invalid JSON response');
            }
            const normalized = normalizeResponse<T>(raw, status);

            if (!resp.ok || !normalized.success) {
                return {
                    ...normalized,
                    success: false,
                    message: normalized.message || resp.statusText || `HTTP ${status}`,
                    errors:
                        normalized.errors ??
                        normalized.details ??
                        [normalized.message || `HTTP ${status}`],
                };
            }

            return normalized;
        } catch (err) {
            if (cfg.signal?.aborted) return this.normalizeFailure<T>(499, 'Request aborted');
            // Network/timeout error retry
            if (attempt <= (cfg.retries ?? this.opts.retries)) {
                const delay = cfg.retryDelayMs ?? this.opts.retryDelayMs!;
                await new Promise((r) => setTimeout(r, delay(attempt)));
                return this.request<T>(endpoint, cfg, attempt + 1, authRetried);
            }
            const msg =
                err instanceof Error ? err.message : 'Network error';
            return this.normalizeFailure<T>(0, msg);
        }
    }

    get<T>(endpoint: string, cfg?: RequestConfig) {
        return this.request<T>(endpoint, { ...cfg, method: 'GET' });
    }

    private prepareBody(body: unknown, type?: RequestConfig['bodyType']): BodyInit | undefined {
        if (type === 'form' && body instanceof FormData) return body;
        if (type === 'raw') return body as BodyInit;
        if (body === undefined) return undefined;
        return JSON.stringify(body);
    }

    post<T>(endpoint: string, body?: unknown, cfg?: RequestConfig) {
        const prepared = this.prepareBody(body, cfg?.bodyType);
        return this.request<T>(endpoint, { ...cfg, method: 'POST', body: prepared });
    }

    put<T>(endpoint: string, body?: unknown, cfg?: RequestConfig) {
        const prepared = this.prepareBody(body, cfg?.bodyType);
        return this.request<T>(endpoint, { ...cfg, method: 'PUT', body: prepared });
    }

    patch<T>(endpoint: string, body?: unknown, cfg?: RequestConfig) {
        const prepared = this.prepareBody(body, cfg?.bodyType);
        return this.request<T>(endpoint, { ...cfg, method: 'PATCH', body: prepared });
    }

    delete<T>(endpoint: string, cfg?: RequestConfig) {
        return this.request<T>(endpoint, { ...cfg, method: 'DELETE' });
    }

    async download(
        endpoint: string,
        cfg: RequestConfig = {},
        attempt = 1,
        authRetried = false
    ): Promise<Response> {
        if (isDemoMode) {
            const { downloadDemo } = await import('@demo-runtime');
            return downloadDemo(endpoint, cfg);
        }
        const {
            params,
            withAuth = true,
            timeoutMs = 15000,
            bodyType = 'json',
            method = 'GET',
            headers: customHeaders,
            ...fetchCfg
        } = cfg;

        const url = this.buildURL(endpoint, params);



        // Создаем базовые заголовки с авторизацией
        const baseHeaders = this.makeHeaders(withAuth, bodyType);
        // Объединяем заголовки: сначала базовые, потом кастомные (кастомные перезаписывают базовые)
        const headers = {
            ...baseHeaders,
            ...customHeaders,
        } as HeadersInit;

        try {
            const resp = await requestFetch(url, {
                ...fetchCfg,
                method,
                headers,
                signal: cfg.signal,
            }, timeoutMs);

            if (resp.status === 401 && this.opts.onUnauthorized && withAuth && !authRetried) {
                await this.opts.onUnauthorized();
                return this.download(endpoint, cfg, attempt, true);
            }

            return resp;
        } catch (err) {
            if (cfg.signal?.aborted) throw err;
            if (attempt <= (cfg.retries ?? this.opts.retries!)) {
                const delay = cfg.retryDelayMs ?? this.opts.retryDelayMs!;
                await new Promise((r) => setTimeout(r, delay(attempt)));
                return this.download(endpoint, cfg, attempt + 1, authRetried);
            }
            // On final failure, rethrow to let caller handle a missing Response instance
            throw err instanceof Error ? err : new Error('Network error');
        }
    }
}

export const apiClient = new ApiClient(API_BASE_URL, {
  retries: 0,
  getToken: () => authManager.getAccessToken(),
  onUnauthorized: async () => {
    await authManager.handleUnauthorized();
  },
});
