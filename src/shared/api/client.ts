// src/shared/api/client.ts
import { API_BASE_URL } from '@shared/config';
import type {
    ApiResponse,
    NormalizedApiResponse,
    RequestConfig,
    ClientOptions,
} from '@shared/types/api';
import { normalizeResponse } from '@shared/types/api';

const isDate = (v: unknown): v is Date => v instanceof Date;
const isPlainObject = (v: unknown): v is Record<string, unknown> =>
    v != null && typeof v === 'object' && !Array.isArray(v) && !isDate(v);

const serializeParamValue = (v: unknown): string => {
    if (v === null) return 'null';
    if (isDate(v)) return v.toISOString();
    if (isPlainObject(v)) return JSON.stringify(v);
    return String(v);
};

const toSearchParams = (params?: RequestConfig['params']) => {
    const sp = new URLSearchParams();
    if (!params) return sp;

    Object.entries(params).forEach(([k, v]) => {
        if (v === undefined) return;
        if (Array.isArray(v)) {
            v.forEach((i) => {
                if (i === undefined) return;
                sp.append(k, serializeParamValue(i));
            });
        } else {
            sp.append(k, serializeParamValue(v));
        }
    });

    return sp;
};

class ApiClient {
    private baseURL: string;
    private opts: ClientOptions;

    constructor(baseURL: string = API_BASE_URL, opts: ClientOptions = { retries: 0}) {
        this.baseURL = baseURL;
        this.opts = {
            retryDelayMs: opts.retryDelayMs ?? ((a) => 300 * 2 ** (a - 1)),
            ...opts,
        };
    }

    private buildURL(endpoint: string, params?: RequestConfig['params']) {
        const base = `${this.baseURL}${endpoint}`;
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
        const {
            params,
            withAuth = true,
            timeoutMs = 15000,
            bodyType = 'json',
            ...fetchCfg
        } = cfg;

        const url = this.buildURL(endpoint, params);

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

        const headers = this.makeHeaders(withAuth, bodyType, fetchCfg.headers);

        try {
            const resp = await fetch(url, { ...fetchCfg, headers, signal: controller.signal });
            clearTimeout(timeoutId);

            const status = resp.status;
            const ct = resp.headers.get('content-type') || '';
            const hasJson = status !== 204 && ct.includes('application/json');

            // Handle 401 with single onUnauthorized replay
            if (status === 401 && this.opts.onUnauthorized && withAuth && !authRetried) {
                await this.opts.onUnauthorized();
                return this.request<T>(endpoint, cfg, attempt, true);
            }

            if (!hasJson) {

                const text = await resp.text().catch(() => '');
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
            } catch {
                return this.normalizeFailure(status, 'Invalid JSON response');
            }
            const normalized = normalizeResponse<T>(raw, status);

            if (!resp.ok || normalized.success === false) {
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
            // Network/timeout error retry
            if (attempt <= (cfg.retries ?? this.opts.retries)) {
                const delay = cfg.retryDelayMs ?? this.opts.retryDelayMs!;
                await new Promise((r) => setTimeout(r, delay(attempt)));
                return this.request<T>(endpoint, cfg, attempt + 1, authRetried);
            }
            const msg =
                err instanceof Error ? err.message : 'Network error';
            return this.normalizeFailure<T>(0, msg);
        } finally {
            clearTimeout(timeoutId);
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
        const {
            params,
            withAuth = true,
            timeoutMs = 15000,
            bodyType = 'json',
            method = 'GET',
            ...fetchCfg
        } = cfg;

        const url = this.buildURL(endpoint, params);

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

        const headers = this.makeHeaders(withAuth, bodyType, fetchCfg.headers);

        try {
            const resp = await fetch(url, {
                ...fetchCfg,
                method,
                headers,
                signal: controller.signal,
            });
            clearTimeout(timeoutId);

            if (resp.status === 401 && this.opts.onUnauthorized && withAuth && !authRetried) {
                await this.opts.onUnauthorized();
                return this.download(endpoint, cfg, attempt, true);
            }

            return resp;
        } catch (err) {
            if (attempt <= (cfg.retries ?? this.opts.retries!)) {
                const delay = cfg.retryDelayMs ?? this.opts.retryDelayMs!;
                await new Promise((r) => setTimeout(r, delay(attempt)));
                return this.download(endpoint, cfg, attempt + 1, authRetried);
            }
            // On final failure, rethrow to let caller handle a missing Response instance
            throw err instanceof Error ? err : new Error('Network error');
        } finally {
            clearTimeout(timeoutId);
        }
    }
}

export const apiClient = new ApiClient();
