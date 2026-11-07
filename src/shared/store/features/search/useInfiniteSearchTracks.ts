import { useCallback } from 'react';

import { useLazySearchTracksQuery } from '@entities/Search/api/rtkApi';
import type { SearchTracksResultDTO } from '@entities/Search/model/types';

import { mergeSearchItems } from './searchPages';
import { useSearchPagination } from './useSearchPagination';

const PAGE_SIZE = 20;
const mergePage = (previous: SearchTracksResultDTO | null, page: SearchTracksResultDTO, offset: number) => ({
  data: { total: page.total, items: mergeSearchItems(previous?.items ?? [], page.items) },
  nextOffset: offset + page.items.length,
  hasMore: page.items.length > 0 && offset + page.items.length < page.total,
});

export function useInfiniteSearchTracks(query: string) {
  const [fetchTracks] = useLazySearchTracksQuery();
  const request = useCallback((offset: number) => fetchTracks({ query, limit: PAGE_SIZE, offset }), [fetchTracks, query]);
  const { data, ...state } = useSearchPagination(query.trim() ? query : null, request, mergePage);
  return { tracks: data?.items ?? [], ...state };
}

