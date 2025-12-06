import { useMemo } from 'react';
import { useAppSelector } from '@shared/store/hooks';
import {
  useSearchQuery,
  useSearchTracksQuery,
  useSearchAlbumsQuery,
  useSearchPlaylistsQuery,
  useSearchArtistsQuery,
  useSearchUsersQuery,
} from '@entities/Search/api/rtkApi';
import type {
  TrackSearchItemDTO,
  AlbumSearchItemDTO,
  PlaylistSearchItemDTO,
  ArtistSearchItemDTO,
  UserSearchItemDTO,
  SearchTracksResultDTO,
  SearchAlbumsResultDTO,
  SearchPlaylistsResultDTO,
  SearchArtistsResultDTO,
  SearchUsersResultDTO,
} from '@entities/Search';

/**
 * Получает все результаты из кэша, которые соответствуют текущему запросу
 * Фильтрует элементы из всех записей кэша по текущему запросу
 */
function getCachedResultsByQuery<T extends { id: number }>(
  cacheEntries: Array<{ query: string; items: T[] }>,
  currentQuery: string,
  getSearchableText: (item: T) => string
): T[] {
  if (!currentQuery.trim()) return [];
  
  const lowerQuery = currentQuery.toLowerCase().trim();
  const result: T[] = [];
  const seenIds = new Set<number>();
  
  // Проходим по всем записям кэша и фильтруем элементы по текущему запросу
  for (const entry of cacheEntries) {
    // Фильтруем элементы этой записи по текущему запросу
    for (const item of entry.items) {
      if (!seenIds.has(item.id)) {
        const searchableText = getSearchableText(item).toLowerCase();
        // Проверяем, содержит ли текст элемента текущий запрос
        if (searchableText.includes(lowerQuery)) {
          result.push(item);
          seenIds.add(item.id);
        }
      }
    }
  }
  
  return result;
}

/**
 * Объединяет результаты из кэша и API, убирая дубликаты
 * Сначала результаты из кэша, потом новые из API
 */
function mergeResults<T extends { id: number }>(
  cachedResults: T[],
  apiResults: T[]
): T[] {
  const result: T[] = [...cachedResults];
  const cachedIds = new Set(cachedResults.map(item => item.id));
  
  // Добавляем только те результаты из API, которых нет в кэше
  const newResults = apiResults.filter(item => !cachedIds.has(item.id));
  result.push(...newResults);
  
  return result;
}

/**
 * Хук для получения результатов поиска треков с кэшированием
 */
export const useSearchTracks = (query: string, limit?: number) => {
  const { cache } = useAppSelector((state) => state.search);
  const shouldSearch = query.trim().length > 0;

  const {
    data: tracksData,
    isLoading: tracksLoading,
    error: tracksError,
  } = useSearchTracksQuery(
    { query, limit },
    { skip: !shouldSearch }
  );

  // Получаем результаты из кэша, которые соответствуют текущему запросу
  const filteredCache = useMemo(() => {
    if (!shouldSearch) return [];
    
    const cacheEntries = cache.map(entry => ({
      query: entry.query,
      items: entry.tracks,
    }));
    
    return getCachedResultsByQuery(cacheEntries, query, (track) => 
      `${track.title} ${track.artists.map(a => a.pseudonym).join(' ')} ${track.albumName || ''}`
    );
  }, [cache, query, shouldSearch]);

  // Объединяем отфильтрованный кэш с новыми результатами
  // Проверяем, что данные из RTK Query соответствуют текущему запросу
  // С правильной сериализацией ключа запроса в RTK Query, это должно быть избыточно,
  // но оставляем для дополнительной безопасности
  const tracks = useMemo(() => {
    // Используем данные из RTK Query только если они соответствуют текущему запросу
    // С правильной сериализацией это должно работать автоматически
    if (!tracksData) return filteredCache;
    
    // Дополнительная проверка: фильтруем результаты из API по текущему запросу
    // на случай, если RTK Query вернул неправильные данные
    const lowerQuery = query.toLowerCase().trim();
    const filteredApiResults = tracksData.items.filter(track => {
      const searchableText = `${track.title} ${track.artists.map(a => a.pseudonym).join(' ')} ${track.albumName || ''}`.toLowerCase();
      return searchableText.includes(lowerQuery);
    });
    
    return mergeResults(filteredCache, filteredApiResults);
  }, [filteredCache, tracksData, query]);

  return {
    tracks,
    isLoading: tracksLoading,
    error: tracksError,
  };
};

/**
 * Хук для получения результатов поиска альбомов с кэшированием
 */
export const useSearchAlbums = (query: string, limit?: number) => {
  const { cache } = useAppSelector((state) => state.search);
  const shouldSearch = query.trim().length > 0;

  const {
    data: albumsData,
    isLoading: albumsLoading,
    error: albumsError,
  } = useSearchAlbumsQuery(
    { query, limit },
    { skip: !shouldSearch }
  );

  // Получаем результаты из кэша, которые соответствуют текущему запросу
  const filteredCache = useMemo(() => {
    if (!shouldSearch) return [];
    
    const cacheEntries = cache.map(entry => ({
      query: entry.query,
      items: entry.albums,
    }));
    
    return getCachedResultsByQuery(cacheEntries, query, (album) => 
      `${album.name} ${album.authors.map(a => a.pseudonym).join(' ')}`
    );
  }, [cache, query, shouldSearch]);

  // Объединяем отфильтрованный кэш с новыми результатами
  // Дополнительная фильтрация результатов из API по текущему запросу
  const albums = useMemo(() => {
    if (!albumsData) return filteredCache;
    
    const lowerQuery = query.toLowerCase().trim();
    const filteredApiResults = albumsData.items.filter(album => {
      const searchableText = `${album.name} ${album.authors.map(a => a.pseudonym).join(' ')}`.toLowerCase();
      return searchableText.includes(lowerQuery);
    });
    
    return mergeResults(filteredCache, filteredApiResults);
  }, [filteredCache, albumsData, query]);

  return {
    albums,
    isLoading: albumsLoading,
    error: albumsError,
  };
};

/**
 * Хук для получения результатов поиска плейлистов с кэшированием
 */
export const useSearchPlaylists = (query: string, limit?: number) => {
  const { cache } = useAppSelector((state) => state.search);
  const shouldSearch = query.trim().length > 0;

  const {
    data: playlistsData,
    isLoading: playlistsLoading,
    error: playlistsError,
  } = useSearchPlaylistsQuery(
    { query, limit },
    { skip: !shouldSearch }
  );

  // Получаем результаты из кэша, которые соответствуют текущему запросу
  const filteredCache = useMemo(() => {
    if (!shouldSearch) return [];
    
    const cacheEntries = cache.map(entry => ({
      query: entry.query,
      items: entry.playlists,
    }));
    
    return getCachedResultsByQuery(cacheEntries, query, (playlist) => 
      `${playlist.name} ${playlist.creatorName} ${playlist.contributorNames.join(' ')}`
    );
  }, [cache, query, shouldSearch]);

  // Объединяем отфильтрованный кэш с новыми результатами
  // Дополнительная фильтрация результатов из API по текущему запросу
  const playlists = useMemo(() => {
    if (!playlistsData) return filteredCache;
    
    const lowerQuery = query.toLowerCase().trim();
    const filteredApiResults = playlistsData.items.filter(playlist => {
      const searchableText = `${playlist.name} ${playlist.creatorName} ${playlist.contributorNames.join(' ')}`.toLowerCase();
      return searchableText.includes(lowerQuery);
    });
    
    return mergeResults(filteredCache, filteredApiResults);
  }, [filteredCache, playlistsData, query]);

  return {
    playlists,
    isLoading: playlistsLoading,
    error: playlistsError,
  };
};

/**
 * Хук для получения результатов поиска артистов с кэшированием
 */
export const useSearchArtists = (query: string, limit?: number) => {
  const { cache } = useAppSelector((state) => state.search);
  const shouldSearch = query.trim().length > 0;

  const {
    data: artistsData,
    isLoading: artistsLoading,
    error: artistsError,
  } = useSearchArtistsQuery(
    { query, limit },
    { skip: !shouldSearch }
  );

  // Получаем результаты из кэша, которые соответствуют текущему запросу
  const filteredCache = useMemo(() => {
    if (!shouldSearch) return [];
    
    const cacheEntries = cache.map(entry => ({
      query: entry.query,
      items: entry.artists,
    }));
    
    return getCachedResultsByQuery(cacheEntries, query, (artist) => artist.artistName);
  }, [cache, query, shouldSearch]);

  // Объединяем отфильтрованный кэш с новыми результатами
  // Дополнительная фильтрация результатов из API по текущему запросу
  const artists = useMemo(() => {
    if (!artistsData) return filteredCache;
    
    const lowerQuery = query.toLowerCase().trim();
    const filteredApiResults = artistsData.items.filter(artist => {
      const searchableText = artist.artistName.toLowerCase();
      return searchableText.includes(lowerQuery);
    });
    
    return mergeResults(filteredCache, filteredApiResults);
  }, [filteredCache, artistsData, query]);

  return {
    artists,
    isLoading: artistsLoading,
    error: artistsError,
  };
};

/**
 * Хук для получения результатов поиска пользователей с кэшированием
 */
export const useSearchUsers = (query: string, limit?: number) => {
  const { cache } = useAppSelector((state) => state.search);
  const shouldSearch = query.trim().length > 0;

  const {
    data: usersData,
    isLoading: usersLoading,
    error: usersError,
  } = useSearchUsersQuery(
    { query, limit },
    { skip: !shouldSearch }
  );

  // Получаем результаты из кэша, которые соответствуют текущему запросу
  const filteredCache = useMemo(() => {
    if (!shouldSearch) return [];
    
    const cacheEntries = cache.map(entry => ({
      query: entry.query,
      items: entry.users,
    }));
    
    return getCachedResultsByQuery(cacheEntries, query, (user) => 
      `${user.userName} ${user.publicIdentifier} ${user.artistName || ''}`
    );
  }, [cache, query, shouldSearch]);

  // Объединяем отфильтрованный кэш с новыми результатами
  // Дополнительная фильтрация результатов из API по текущему запросу
  const users = useMemo(() => {
    if (!usersData) return filteredCache;
    
    const lowerQuery = query.toLowerCase().trim();
    const filteredApiResults = usersData.items.filter(user => {
      const searchableText = `${user.userName} ${user.publicIdentifier} ${user.artistName || ''}`.toLowerCase();
      return searchableText.includes(lowerQuery);
    });
    
    return mergeResults(filteredCache, filteredApiResults);
  }, [filteredCache, usersData, query]);

  return {
    users,
    isLoading: usersLoading,
    error: usersError,
  };
};

/**
 * Хук для получения всех результатов поиска с кэшированием
 */
export const useSearchResults = (query: string, category: 'All' | 'Radio' | 'Playlists' | 'Creators', limit?: number) => {
  const shouldSearch = query.trim().length > 0;

  // Используем общий поиск для категории "All"
  const {
    data: searchData,
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
  const result = useMemo(() => {
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
  }, [shouldSearch, category, query, searchData, tracksResult, playlistsResult, artistsResult, usersResult]);

  const isLoading = category === 'All' 
    ? isSearchLoading 
    : tracksResult.isLoading || playlistsResult.isLoading || artistsResult.isLoading || usersResult.isLoading || albumsResult.isLoading;

  return {
    data: result,
    isLoading,
    error: searchError || tracksResult.error || playlistsResult.error || artistsResult.error || usersResult.error,
  };
};

