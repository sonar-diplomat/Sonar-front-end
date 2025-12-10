import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useLazySearchTracksQuery } from '@entities/Search/api/rtkApi';
import type { TrackSearchItemDTO } from '@entities/Search';

const PAGE_SIZE = 20;

/**
 * Хук для бесконечной прокрутки треков с пагинацией
 */
export const useInfiniteSearchTracks = (query: string) => {
  const [allTracks, setAllTracks] = useState<TrackSearchItemDTO[]>([]);
  const [currentOffset, setCurrentOffset] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [initialLoaded, setInitialLoaded] = useState(false);
  const isLoadingInitialRef = useRef(false);
  
  const [fetchTracks, { isLoading: isFetching }] = useLazySearchTracksQuery();

  // Сбрасываем состояние при изменении запроса
  useEffect(() => {
    setAllTracks([]);
    setCurrentOffset(0);
    setHasMore(false);
    setInitialLoaded(false);
    isLoadingInitialRef.current = false;
  }, [query]);

  // Загружаем первую страницу при изменении запроса
  useEffect(() => {
    if (!query.trim() || isLoadingInitialRef.current) return;

    const loadInitial = async () => {
      isLoadingInitialRef.current = true;
      try {
        const result = await fetchTracks({ query, limit: PAGE_SIZE, offset: 0 }).unwrap();
        setAllTracks(result.items);
        setCurrentOffset(result.items.length);
        setHasMore(result.items.length === PAGE_SIZE && result.items.length < result.total);
        setInitialLoaded(true);
      } catch (error) {
        console.error('Error loading initial tracks:', error);
        setHasMore(false);
        setInitialLoaded(true);
      } finally {
        isLoadingInitialRef.current = false;
      }
    };

    void loadInitial();
  }, [query, fetchTracks]);

  // Функция для загрузки следующей страницы
  const loadMore = useCallback(async () => {
    if (!query.trim() || isLoadingMore || isLoadingInitialRef.current || !hasMore || isFetching) return;

    setIsLoadingMore(true);
    try {
      const result = await fetchTracks({ 
        query, 
        limit: PAGE_SIZE, 
        offset: currentOffset 
      }).unwrap();

      if (result.items.length > 0) {
        // Объединяем новые результаты с существующими, убирая дубликаты
        const existingIds = new Set(allTracks.map(t => t.id));
        const newTracks = result.items.filter(t => !existingIds.has(t.id));
        setAllTracks(prev => {
          const updated = [...prev, ...newTracks];
          setCurrentOffset(updated.length);
          setHasMore(result.items.length === PAGE_SIZE && updated.length < result.total);
          return updated;
        });
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error('Error loading more tracks:', error);
      setHasMore(false);
    } finally {
      setIsLoadingMore(false);
    }
  }, [query, currentOffset, allTracks, hasMore, isLoadingMore, isFetching, fetchTracks]);

  const isLoading = isLoadingInitialRef.current || (isFetching && allTracks.length === 0);

  return {
    tracks: allTracks,
    loadMore,
    hasMore,
    isLoading,
    isLoadingMore,
    initialLoaded,
  };
};

