/**
 * Главный файл для экспорта RTK Query API и hooks
 * 
 * Использование:
 * import { rtkApi } from '@shared/api/rtkApi'; // базовый API
 * import { useGetTrackQuery } from '@shared/api'; // hooks (после инициализации)
 * 
 * Или напрямую из сущностей:
 * import { useGetTrackQuery } from '@entities/Music/api/rtkApi';
 */

// Экспортируем базовый API
export { rtkApi } from './rtkApi';

// Re-export всех hooks
// Этот файл должен импортироваться после инициализации всех endpoints в store/index.ts
// Импортируем hooks через отдельный файл, чтобы избежать циклической зависимости
export * from './rtkApiHooks';
