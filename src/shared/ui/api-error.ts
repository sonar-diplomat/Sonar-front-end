export interface UiApiError { status?: number | string; message?: string; data?: { message?: string; errors?: string[]; details?: string[] } }
const record = (value: unknown): Record<string, unknown> => value && typeof value === 'object' ? value as Record<string, unknown> : {};
const strings = (value: unknown): string[] | undefined => Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : undefined;
export function asUiApiError(error: unknown): UiApiError {
    const value = record(error); const data = record(value.data);
    return { status: typeof value.status === 'number' || typeof value.status === 'string' ? value.status : undefined, message: typeof value.message === 'string' ? value.message : undefined, data: {
        message: typeof data.message === 'string' ? data.message : undefined,
        errors: strings(data.errors), details: strings(data.details),
    } };
}
