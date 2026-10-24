export const dataSource: 'api' | 'mock' = import.meta.env.VITE_DATA_SOURCE ?? 'api';
export const isDemoMode = dataSource === 'mock';
