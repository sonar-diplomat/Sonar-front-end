import { createSlice,type PayloadAction } from '@reduxjs/toolkit';

import { searchApi } from '@entities/Search/api/rtkApi';
import type {
AlbumSearchItemDTO,
ArtistSearchItemDTO,
PlaylistSearchItemDTO,
TrackSearchItemDTO,
UserSearchItemDTO,
} from '@entities/Search/model/types';

import { mergeSearchItems } from './searchPages';

interface SearchItems {
  tracks: TrackSearchItemDTO[];
  albums: AlbumSearchItemDTO[];
  playlists: PlaylistSearchItemDTO[];
  artists: ArtistSearchItemDTO[];
  users: UserSearchItemDTO[];
}

type SearchKind = keyof SearchItems;
type SearchItem = SearchItems[SearchKind][number];
type SearchPage = { query: string; offset?: number } & Partial<SearchItems>;
interface SearchCacheEntry extends SearchItems {
  query: string;
  pages: Partial<Record<SearchKind, Record<number, SearchItem[]>>>;
}

interface SearchState { cache: SearchCacheEntry[] }
const initialState: SearchState = { cache: [] };
const kinds: SearchKind[] = ['tracks', 'albums', 'playlists', 'artists', 'users'];

function storePage(state: SearchState, { query, offset = 0, ...results }: SearchPage): void {
  const existingIndex = state.cache.findIndex(entry => entry.query === query);
  const entry = existingIndex === -1
    ? { query, pages: {}, tracks: [], albums: [], playlists: [], artists: [], users: [] } as SearchCacheEntry
    : state.cache.splice(existingIndex, 1)[0];

  for (const kind of kinds) {
    const items = results[kind];
    if (items === undefined) continue;
    // A fresh first page invalidates the offsets of all older pages for this kind.
    const pages = offset === 0 ? {} : entry.pages[kind] ?? {};
    pages[offset] = items;
    entry.pages[kind] = pages;
    const merged = Object.values(pages).reduce<SearchItem[]>((all, page) => mergeSearchItems(all, page), []);
    Object.assign(entry, { [kind]: merged });
  }
  state.cache.unshift(entry);
  state.cache.length = Math.min(state.cache.length, 3);
}

const searchSlice = createSlice({
  name: 'search',
  initialState,
  reducers: {
    addSearchResults: (state, action: PayloadAction<SearchPage>) => storePage(state, action.payload),
    clearCache: () => initialState,
  },
  extraReducers: builder => {
    const { search, searchTracks, searchAlbums, searchPlaylists, searchArtists, searchUsers } = searchApi.endpoints;
    builder
      .addMatcher(search.matchFulfilled, (state, { payload, meta }) => storePage(state, {
        ...meta.arg.originalArgs,
        tracks: payload.tracks?.items,
        albums: payload.albums?.items,
        playlists: payload.playlists?.items,
        artists: payload.artists?.items,
        users: payload.users?.items,
      }))
      .addMatcher(searchTracks.matchFulfilled, (state, { payload, meta }) => storePage(state, { ...meta.arg.originalArgs, tracks: payload.items }))
      .addMatcher(searchAlbums.matchFulfilled, (state, { payload, meta }) => storePage(state, { ...meta.arg.originalArgs, albums: payload.items }))
      .addMatcher(searchPlaylists.matchFulfilled, (state, { payload, meta }) => storePage(state, { ...meta.arg.originalArgs, playlists: payload.items }))
      .addMatcher(searchArtists.matchFulfilled, (state, { payload, meta }) => storePage(state, { ...meta.arg.originalArgs, artists: payload.items }))
      .addMatcher(searchUsers.matchFulfilled, (state, { payload, meta }) => storePage(state, { ...meta.arg.originalArgs, users: payload.items }));
  },
});

export const { addSearchResults, clearCache } = searchSlice.actions;
export default searchSlice.reducer;

