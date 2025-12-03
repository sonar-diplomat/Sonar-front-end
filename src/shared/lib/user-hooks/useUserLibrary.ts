import { useMemo } from 'react';
import {
  useGetFoldersQuery,
  useGetClientSettingsQuery,
} from '@shared/api';

export const useUserLibrary = () => {
  const {
    data: folders,
    isLoading: foldersLoading,
    error: foldersError,
    refetch: refetchFolders,
  } = useGetFoldersQuery();

  const {
    data: settings,
    isLoading: settingsLoading,
    error: settingsError,
    refetch: refetchSettings,
  } = useGetClientSettingsQuery();

  const isLoading = foldersLoading || settingsLoading;
  const error = foldersError || settingsError;

  const library = useMemo(() => {
    if (!folders) return null;

    // Находим Root папку (где parentFolderId === null)
    const rootFolder = folders.find(f => f.parentFolderId === null || f.parentFolderId === undefined);
    
    // Если есть Root папка, используем её содержимое, иначе используем все папки
    const foldersToProcess = rootFolder 
      ? folders.filter(f => f.id !== rootFolder.id && f.parentFolderId !== null)
      : folders;
    
    // Собираем коллекции из Root папки (если есть) и остальных папок
    const rootCollections = rootFolder ? rootFolder.collections : [];
    const otherCollections = foldersToProcess.flatMap(f => f.collections);
    const allCollections = [...rootCollections, ...otherCollections];

    const allPlaylists = allCollections.filter(c => c.type === 'Playlist');
    const allAlbums = allCollections.filter(c => c.type === 'Album');
    const allBlends = allCollections.filter(c => c.type === 'Blend');

    // Формируем список папок: subFolders из Root + остальные папки
    const processedFolders = rootFolder
      ? [
          ...rootFolder.subFolders.map(sf => {
            // Находим полную информацию о подпапке из списка папок
            const fullFolder = folders.find(f => f.id === sf.id);
            return fullFolder || {
              id: sf.id,
              name: sf.name,
              isProtected: sf.isProtected,
              parentFolderId: rootFolder.id,
              parentFolderName: rootFolder.name,
              subFolders: [],
              collections: [],
            };
          }),
          ...foldersToProcess
        ]
      : folders;

    return {
      folders: processedFolders,
      playlists: allPlaylists,
      albums: allAlbums,
      blends: allBlends,
      totalCollections: allCollections.length,
    };
  }, [folders]);

  const refetchAll = () => {
    void refetchFolders();
    void refetchSettings();
  };

  return {
    library,
    settings,
    isLoading,
    error,
    refetch: refetchAll,
  };
};
