import { useMemo } from 'react';
import {
  useGetFoldersQuery,
  useGetClientSettingsQuery,
} from '@shared/api/rtkApi';

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

    const allPlaylists = folders.flatMap(folder =>
      folder.collections.filter(c => c.type === 'Playlist')
    );

    const allAlbums = folders.flatMap(folder =>
      folder.collections.filter(c => c.type === 'Album')
    );

    const allBlends = folders.flatMap(folder =>
      folder.collections.filter(c => c.type === 'Blend')
    );

    return {
      folders,
      playlists: allPlaylists,
      albums: allAlbums,
      blends: allBlends,
      totalCollections: folders.reduce((sum, f) => sum + f.collections.length, 0),
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
