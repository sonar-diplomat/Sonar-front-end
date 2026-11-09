import {
useSearchAlbumsQuery,
useSearchArtistsQuery,
useSearchPlaylistsQuery,
useSearchQuery,
useSearchTracksQuery,
useSearchUsersQuery,
} from '@entities/Search/api/rtkApi';
import { useAppSelector } from '@shared/store/hooks';

function useCachedQuery(query: string) {
  return useAppSelector(state => state.search.cache.find(entry => entry.query === query));
}

const queryOptions = (query: string) => ({ skip: !query.trim(), refetchOnMountOrArgChange: true });

export function useSearchTracks(query: string, limit?: number) {
  const { currentData, isLoading, error } = useSearchTracksQuery({ query, limit }, queryOptions(query));
  const cached = useCachedQuery(query);
  return { tracks: currentData?.items ?? cached?.tracks.slice(0, limit ?? 20) ?? [], isLoading, error };
}

export function useSearchAlbums(query: string, limit?: number) {
  const { currentData, isLoading, error } = useSearchAlbumsQuery({ query, limit }, queryOptions(query));
  const cached = useCachedQuery(query);
  return { albums: currentData?.items ?? cached?.albums.slice(0, limit ?? 20) ?? [], isLoading, error };
}

export function useSearchPlaylists(query: string, limit?: number) {
  const { currentData, isLoading, error } = useSearchPlaylistsQuery({ query, limit }, queryOptions(query));
  const cached = useCachedQuery(query);
  return { playlists: currentData?.items ?? cached?.playlists.slice(0, limit ?? 20) ?? [], isLoading, error };
}

export function useSearchArtists(query: string, limit?: number) {
  const { currentData, isLoading, error } = useSearchArtistsQuery({ query, limit }, queryOptions(query));
  const cached = useCachedQuery(query);
  return { artists: currentData?.items ?? cached?.artists.slice(0, limit ?? 20) ?? [], isLoading, error };
}

export function useSearchUsers(query: string, limit?: number) {
  const { currentData, isLoading, error } = useSearchUsersQuery({ query, limit }, queryOptions(query));
  const cached = useCachedQuery(query);
  return { users: currentData?.items ?? cached?.users.slice(0, limit ?? 20) ?? [], isLoading, error };
}
export const useSearchResults = (query: string, category: 'All' | 'Radio' | 'Playlists' | 'Creators', limit?: number) => {
  const shouldSearch = query.trim().length > 0;

  // Используем общий поиск для категории "All"
  const {
    currentData: searchData,
    isLoading: isSearchLoading,
    error: searchError,
  } = useSearchQuery(
    { query, category: 'All', limit },
    { skip: !shouldSearch || category !== 'All' }
  );

  // Используем отдельные хуки для категорий
  const tracksResult = useSearchTracks(query, limit);
  const playlistsResult = useSearchPlaylists(query, limit);
  const artistsResult = useSearchArtists(query, limit);
  const usersResult = useSearchUsers(query, limit);
  const albumsResult = useSearchAlbums(query, limit);

  // Определяем данные в зависимости от категории
  const result = (() => {
    if (!shouldSearch) return null;

    if (category === 'All') {
      return searchData || null;
    }

    if (category === 'Radio') {
      return {
        query,
        totalResults: tracksResult.tracks.length,
        tracks: {
          total: tracksResult.tracks.length,
          items: tracksResult.tracks,
        },
      };
    }

    if (category === 'Playlists') {
      return {
        query,
        totalResults: playlistsResult.playlists.length,
        playlists: {
          total: playlistsResult.playlists.length,
          items: playlistsResult.playlists,
        },
      };
    }

    if (category === 'Creators') {
      return {
        query,
        totalResults: artistsResult.artists.length + usersResult.users.length,
        artists: {
          total: artistsResult.artists.length,
          items: artistsResult.artists,
        },
        users: {
          total: usersResult.users.length,
          items: usersResult.users,
        },
      };
    }

    return null;
  })();

  const isLoading = category === 'All' 
    ? isSearchLoading 
    : tracksResult.isLoading || playlistsResult.isLoading || artistsResult.isLoading || usersResult.isLoading || albumsResult.isLoading;

  return {
    data: result,
    isLoading,
    error: searchError || tracksResult.error || playlistsResult.error || artistsResult.error || usersResult.error,
  };
};

