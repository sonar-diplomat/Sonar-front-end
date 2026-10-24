import type { NormalizedApiResponse,RequestConfig } from '../types/api';

/** Compatibility for legacy imperative hooks; RTK owns query caching and transport. */
export async function legacyQuery<T>(request: () => Promise<T>, _config?: RequestConfig): Promise<NormalizedApiResponse<T>> {
  void _config;
  try { return { success: true, status: 200, message: 'OK', data: await request() }; }
  catch (error) {
    const value = error && typeof error === 'object' ? error as { status?: unknown; data?: { message?: string; errors?: string[]; details?: string[] } } : {};
    const message = value.data?.message ?? (error instanceof Error ? error.message : 'Request failed');
    return { success: false, status: typeof value.status === 'number' ? value.status : 0, message, errors: value.data?.errors ?? [message], details: value.data?.details };
  }
}
