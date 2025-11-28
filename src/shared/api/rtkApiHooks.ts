/**
 * Централизованный экспорт всех RTK Query hooks
 * Этот файл должен импортироваться после инициализации всех endpoints в store/index.ts
 * 
 * Каждая сущность экспортирует свои hooks из своего rtkApi.ts файла,
 * здесь мы просто re-экспортируем их все для удобства использования
 */

// Re-export всех hooks из каждой сущности
export * from '@entities/Music/api/rtkApi';
export * from '@entities/User/api/rtkApi';
export * from '@entities/Chat/api/rtkApi';
export * from '@entities/Playlist/api/rtkApi';
export * from '@entities/Album/api/rtkApi';
export * from '@entities/Library/api/rtkApi';
export * from '@entities/ClientSettings/api/rtkApi';
export * from '@entities/Access/api/rtkApi';
export * from '@entities/Gift/api/rtkApi';
export * from '@entities/Report/api/rtkApi';
export * from '@entities/Subscription/api/rtkApi';
export * from '@entities/Distribution/api/rtkApi';
export * from '@entities/UserState/api/rtkApi';
export * from '@entities/Collection/api/rtkApi';
export * from '@entities/Blend/api/rtkApi';
export * from '@entities/Artist/api/rtkApi';
export * from '@entities/Share/api/rtkApi';
export * from '@features/auth/api/rtkApi';

