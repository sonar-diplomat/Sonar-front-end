import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { searchApi } from '@entities/Search/api/rtkApi';
import type {
  TrackSearchItemDTO,
  AlbumSearchItemDTO,
  PlaylistSearchItemDTO,
  ArtistSearchItemDTO,
  UserSearchItemDTO,
} from '@entities/Search';

export interface SearchCacheEntry {
  query: string;
  timestamp: number;
  tracks: TrackSearchItemDTO[];
  albums: AlbumSearchItemDTO[];
  playlists: PlaylistSearchItemDTO[];
  artists: ArtistSearchItemDTO[];
  users: UserSearchItemDTO[];
}

export interface SearchState {
  cache: SearchCacheEntry[];
}

const MAX_CACHE_ENTRIES = 3;

const initialState: SearchState = {
  cache: [],
};

const searchSlice = createSlice({
  name: 'search',
  initialState,
  reducers: {
    addSearchResults: (state, action: PayloadAction<{ query: string; tracks?: TrackSearchItemDTO[]; albums?: AlbumSearchItemDTO[]; playlists?: PlaylistSearchItemDTO[]; artists?: ArtistSearchItemDTO[]; users?: UserSearchItemDTO[] }>) => {
      const { query, tracks, albums, playlists, artists, users } = action.payload;
      
      // Ищем существующую запись для этого запроса
      const existingEntryIndex = state.cache.findIndex(entry => entry.query === query);
      
      if (existingEntryIndex >= 0) {
        // Обновляем существующую запись
        const entry = state.cache[existingEntryIndex];
        entry.timestamp = Date.now();
        
        // Объединяем результаты, убирая дубликаты
        if (tracks) {
          const existingIds = new Set(entry.tracks.map(t => t.id));
          const newTracks = tracks.filter(t => !existingIds.has(t.id));
          entry.tracks.push(...newTracks);
        }
        if (albums) {
          const existingIds = new Set(entry.albums.map(a => a.id));
          const newAlbums = albums.filter(a => !existingIds.has(a.id));
          entry.albums.push(...newAlbums);
        }
        if (playlists) {
          const existingIds = new Set(entry.playlists.map(p => p.id));
          const newPlaylists = playlists.filter(p => !existingIds.has(p.id));
          entry.playlists.push(...newPlaylists);
        }
        if (artists) {
          const existingIds = new Set(entry.artists.map(a => a.id));
          const newArtists = artists.filter(a => !existingIds.has(a.id));
          entry.artists.push(...newArtists);
        }
        if (users) {
          const existingIds = new Set(entry.users.map(u => u.id));
          const newUsers = users.filter(u => !existingIds.has(u.id));
          entry.users.push(...newUsers);
        }
      } else {
        // Создаем новую запись
        const newEntry: SearchCacheEntry = {
          query,
          timestamp: Date.now(),
          tracks: tracks || [],
          albums: albums || [],
          playlists: playlists || [],
          artists: artists || [],
          users: users || [],
        };
        
        // Добавляем новую запись
        state.cache.push(newEntry);
        
        // Сортируем по timestamp (новые первыми)
        state.cache.sort((a, b) => b.timestamp - a.timestamp);
        
        // Оставляем только последние MAX_CACHE_ENTRIES записей
        if (state.cache.length > MAX_CACHE_ENTRIES) {
          state.cache = state.cache.slice(0, MAX_CACHE_ENTRIES);
        }
      }
    },
    clearCache: (state) => {
      state.cache = [];
    },
  },
  extraReducers: (builder) => {
    // Вспомогательная функция для добавления результатов в кэш
    const addToCache = (
      state: SearchState,
      query: string,
      tracks?: TrackSearchItemDTO[],
      albums?: AlbumSearchItemDTO[],
      playlists?: PlaylistSearchItemDTO[],
      artists?: ArtistSearchItemDTO[],
      users?: UserSearchItemDTO[]
    ) => {
      // Ищем существующую запись для этого запроса
      const existingEntryIndex = state.cache.findIndex(entry => entry.query === query);
      
      if (existingEntryIndex >= 0) {
        // Обновляем существующую запись
        const entry = state.cache[existingEntryIndex];
        entry.timestamp = Date.now();
        
        // Объединяем результаты, убирая дубликаты
        if (tracks) {
          const existingIds = new Set(entry.tracks.map(t => t.id));
          const newTracks = tracks.filter(t => !existingIds.has(t.id));
          entry.tracks.push(...newTracks);
        }
        if (albums) {
          const existingIds = new Set(entry.albums.map(a => a.id));
          const newAlbums = albums.filter(a => !existingIds.has(a.id));
          entry.albums.push(...newAlbums);
        }
        if (playlists) {
          const existingIds = new Set(entry.playlists.map(p => p.id));
          const newPlaylists = playlists.filter(p => !existingIds.has(p.id));
          entry.playlists.push(...newPlaylists);
        }
        if (artists) {
          const existingIds = new Set(entry.artists.map(a => a.id));
          const newArtists = artists.filter(a => !existingIds.has(a.id));
          entry.artists.push(...newArtists);
        }
        if (users) {
          const existingIds = new Set(entry.users.map(u => u.id));
          const newUsers = users.filter(u => !existingIds.has(u.id));
          entry.users.push(...newUsers);
        }
      } else {
        // Создаем новую запись
        const newEntry: SearchCacheEntry = {
          query,
          timestamp: Date.now(),
          tracks: tracks || [],
          albums: albums || [],
          playlists: playlists || [],
          artists: artists || [],
          users: users || [],
        };
        
        // Добавляем новую запись
        state.cache.push(newEntry);
        
        // Сортируем по timestamp (новые первыми)
        state.cache.sort((a, b) => b.timestamp - a.timestamp);
        
        // Оставляем только последние MAX_CACHE_ENTRIES записей
        if (state.cache.length > MAX_CACHE_ENTRIES) {
          state.cache = state.cache.slice(0, MAX_CACHE_ENTRIES);
        }
      }
    };

    // Обработка успешных запросов search (общий поиск)
    builder.addMatcher(
      searchApi.endpoints.search.matchFulfilled,
      (state, action) => {
        const query = action.meta.arg.originalArgs.query;
        addToCache(
          state,
          query,
          action.payload.tracks?.items,
          action.payload.albums?.items,
          action.payload.playlists?.items,
          action.payload.artists?.items,
          action.payload.users?.items
        );
      }
    );

    // Обработка успешных запросов searchTracks
    builder.addMatcher(
      searchApi.endpoints.searchTracks.matchFulfilled,
      (state, action) => {
        const query = action.meta.arg.originalArgs.query;
        addToCache(state, query, action.payload.items);
      }
    );

    // Обработка успешных запросов searchAlbums
    builder.addMatcher(
      searchApi.endpoints.searchAlbums.matchFulfilled,
      (state, action) => {
        const query = action.meta.arg.originalArgs.query;
        addToCache(state, query, undefined, action.payload.items);
      }
    );

    // Обработка успешных запросов searchPlaylists
    builder.addMatcher(
      searchApi.endpoints.searchPlaylists.matchFulfilled,
      (state, action) => {
        const query = action.meta.arg.originalArgs.query;
        addToCache(state, query, undefined, undefined, action.payload.items);
      }
    );

    // Обработка успешных запросов searchArtists
    builder.addMatcher(
      searchApi.endpoints.searchArtists.matchFulfilled,
      (state, action) => {
        const query = action.meta.arg.originalArgs.query;
        addToCache(state, query, undefined, undefined, undefined, action.payload.items);
      }
    );

    // Обработка успешных запросов searchUsers
    builder.addMatcher(
      searchApi.endpoints.searchUsers.matchFulfilled,
      (state, action) => {
        const query = action.meta.arg.originalArgs.query;
        addToCache(state, query, undefined, undefined, undefined, undefined, action.payload.items);
      }
    );
  },
});

export const {
  addSearchResults,
  clearCache,
} = searchSlice.actions;

export default searchSlice.reducer;

