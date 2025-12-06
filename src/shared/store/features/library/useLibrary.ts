import { useMemo, useEffect } from 'react';
import { useAppSelector } from '@shared/store/hooks';
import { useGetFoldersQuery, useGetFolderQuery } from '@entities/Library/api/rtkApi';
import type { FolderDTO } from '@entities/Library';

/**
 * Хук для получения списка всех папок
 * Использует кэш из Redux store и делает запросы только при необходимости
 */
export const useFolders = () => {
  const { foldersList, isDirty } = useAppSelector((state) => state.library);

  // Запрос списка всех папок - пропускаем только если данные актуальны, но refetch всегда доступен
  const {
    data: foldersData,
    isLoading: foldersLoading,
    error: foldersError,
    refetch: refetchFolders,
  } = useGetFoldersQuery(undefined, {
    skip: !isDirty && foldersList !== null, // Пропускаем запрос, если данные актуальны
  });

  // Автоматически обновляем данные, если библиотека помечена как "грязная"
  useEffect(() => {
    if (isDirty && !foldersLoading) {
      void refetchFolders();
    }
  }, [isDirty, foldersLoading, refetchFolders]);

  // Возвращаем данные из кэша во время загрузки, чтобы не показывать пустую библиотеку
  // Когда запрос завершится, extraReducers обновит кэш и данные обновятся автоматически
  const folders = useMemo(() => {
    // Если есть данные в кэше, показываем их (даже во время загрузки)
    if (foldersList) {
      return foldersList;
    }
    // Если кэша нет, показываем данные из запроса
    return foldersData || null;
  }, [foldersList, foldersData]);

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

  const {
    data: folderData,
    isLoading: folderLoading,
    error: folderError,
    refetch: refetchFolder,
  } = useGetFolderQuery(folderId!, {
    skip: folderId === null, // Пропускаем только если folderId === null
  });

  // Автоматически обновляем данные папки, если библиотека помечена как "грязная"
  useEffect(() => {
    if (folderId !== null && isDirty && !folderLoading && cachedFolder) {
      void refetchFolder();
    }
  }, [folderId, isDirty, folderLoading, cachedFolder, refetchFolder]);

  // Возвращаем данные из кэша во время загрузки, чтобы не показывать пустую папку
  // Когда запрос завершится, extraReducers обновит кэш и данные обновятся автоматически
  const folder = useMemo(() => {
    // Если есть данные в кэше, показываем их (даже во время загрузки)
    if (cachedFolder) {
      return cachedFolder;
    }
    // Если кэша нет, показываем данные из запроса
    return folderData || null;
  }, [cachedFolder, folderData]);

  return {
    folder,
    isLoading: folderLoading,
    error: folderError,
  };
};

