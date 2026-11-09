import { useCallback } from 'react';

import { useLazySearchQuery } from '@entities/Search/api/rtkApi';
import type { SearchCategory,SearchResultDTO } from '@entities/Search/model/types';

import { mergeSearchItems } from './searchPages';
import { useSearchPagination } from './useSearchPagination';

const PAGE_SIZE = 20;
const kinds = ['tracks', 'albums', 'playlists', 'artists', 'users'] as const;

function mergeCategory<T extends { id: number }>(previous: { total: number; items: T[] } | undefined, page: { total: number; items: T[] } | undefined) {
  if (!page) return previous;
  return { total: page.total, items: mergeSearchItems(previous?.items ?? [], page.items) };
}

function mergePage(previous: SearchResultDTO | null, page: SearchResultDTO, offset: number) {
  const data = {
    ...page,
    tracks: mergeCategory(previous?.tracks, page.tracks),
    albums: mergeCategory(previous?.albums, page.albums),
    playlists: mergeCategory(previous?.playlists, page.playlists),
    artists: mergeCategory(previous?.artists, page.artists),
    users: mergeCategory(previous?.users, page.users),
  };
  const nextOffset = offset + PAGE_SIZE;
  const hasMore = kinds.some(kind => (page[kind]?.total ?? 0) > nextOffset);
  return { data, nextOffset, hasMore };
}

export function useCatalogSearch(query: string, category?: SearchCategory) {
  const [fetchSearch] = useLazySearchQuery();
  const request = useCallback((offset: number) => fetchSearch({ query, category, offset, limit: PAGE_SIZE }), [fetchSearch, query, category]);
  const key = query.trim() ? JSON.stringify([query, category]) : null;
  return useSearchPagination(key, request, mergePage);
}
