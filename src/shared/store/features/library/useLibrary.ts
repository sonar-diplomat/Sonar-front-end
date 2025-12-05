import { useMemo } from 'react';
import { useAppSelector } from '@shared/store/hooks';
import { useGetFoldersQuery, useGetFolderQuery } from '@entities/Library/api/rtkApi';
import type { FolderDTO } from '@entities/Library';

/**
 * Хук для получения списка всех папок
 * Использует кэш из Redux store и делает запросы только при необходимости
 */
export const useFolders = () => {
  const { foldersList, isDirty } = useAppSelector((state) => state.library);

  // Запрос списка всех папок - выполняется только если isDirty или данных нет
  const {
    data: foldersData,
    isLoading: foldersLoading,
    error: foldersError,
    refetch: refetchFolders,
  } = useGetFoldersQuery(undefined, {
    skip: !isDirty && foldersList !== null, // Пропускаем запрос, если данные актуальны
  });

  // Возвращаем данные из кэша, если они есть и актуальны, иначе из запроса
  const folders = useMemo(() => {
    if (!isDirty && foldersList) {
      return foldersList;
    }
    return foldersData || null;
  }, [foldersList, foldersData, isDirty]);

  return {
    folders,
    isLoading: foldersLoading,
    error: foldersError,
    refetchFolders,
    isDirty,
  };
};

/**
 * Хук для получения конкретной папки по ID
 * Использует кэш, если папка уже загружена, иначе делает запрос
 */
export const useFolder = (folderId: number | null) => {
  const { foldersCache, isDirty } = useAppSelector((state) => state.library);

  const cachedFolder = folderId !== null ? foldersCache[folderId] : null;
  const shouldSkip = folderId === null || (cachedFolder !== undefined && !isDirty);

  const {
    data: folderData,
    isLoading: folderLoading,
    error: folderError,
  } = useGetFolderQuery(folderId!, {
    skip: shouldSkip,
  });

  // Возвращаем данные из кэша, если они есть и актуальны, иначе из запроса
  const folder = useMemo(() => {
    if (!isDirty && cachedFolder) {
      return cachedFolder;
    }
    return folderData || null;
  }, [cachedFolder, folderData, isDirty]);

  return {
    folder,
    isLoading: folderLoading,
    error: folderError,
  };
};

