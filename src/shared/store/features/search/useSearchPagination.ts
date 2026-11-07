import { useCallback,useLayoutEffect,useRef,useState } from 'react';

import { store } from '@shared/store';
import { useAppSelector } from '@shared/store/hooks';

interface Request<T> {
  abort(): void;
  unwrap(): Promise<T>;
}
interface Page<T> {
  data: T;
  hasMore: boolean;
  nextOffset: number;
}
interface Generation<T> {
  key: string;
  sessionVersion: number;
  page: Page<T> | null;
  request: Request<T> | null;
}
interface View<T> {
  key: string;
  sessionVersion: number;
  loading: 'initial' | 'more' | null;
  error?: unknown;
  page: Page<T> | null;
}

export function useSearchPagination<T>(
  key: string | null,
  requestPage: (offset: number) => Request<T>,
  mergePage: (previous: T | null, page: T, offset: number) => Page<T>,
) {
  const sessionVersion = useAppSelector(state => state.auth.sessionVersion);
  const current = useRef<Generation<T> | null>(null);
  const [view, setView] = useState<View<T> | null>(null);

  const load = useCallback(async (generation: Generation<T>, offset: number) => {
    const isCurrent = () => current.current === generation && store.getState().auth.sessionVersion === generation.sessionVersion;
    if (!isCurrent() || generation.request) return;
    const scope = { key: generation.key, sessionVersion: generation.sessionVersion };
    const request = requestPage(offset);
    generation.request = request;
    setView({ ...scope, page: generation.page, loading: offset === 0 ? 'initial' : 'more' });
    try {
      const result = await request.unwrap();
      if (!isCurrent()) return;
      generation.page = mergePage(offset === 0 ? null : generation.page?.data ?? null, result, offset);
      setView({ ...scope, page: generation.page, loading: null });
    } catch (error) {
      if (isCurrent()) setView({ ...scope, page: generation.page, loading: null, error });
    } finally {
      generation.request = null;
    }
  }, [requestPage, mergePage]);

  useLayoutEffect(() => {
    setView(null);
    if (key === null) return;
    const generation: Generation<T> = { key, sessionVersion, page: null, request: null };
    current.current = generation;
    // Start after Strict Mode's setup/cleanup probe so it cannot abort the first RTK query.
    const timer = setTimeout(() => { void load(generation, 0); }, 0);
    return () => {
      clearTimeout(timer);
      current.current = null;
      generation.request?.abort();
    };
  }, [key, load, sessionVersion]);

  const loadMore = useCallback(() => {
    const generation = current.current;
    if (generation?.page?.hasMore && generation.key === key) void load(generation, generation.page.nextOffset);
  }, [key, load]);

  const retry = useCallback(() => {
    const generation = current.current;
    if (generation && generation.key === key) void load(generation, 0);
  }, [key, load]);

  const activeView = key !== null && view?.key === key && view.sessionVersion === sessionVersion ? view : null;
  return {
    data: activeView?.page?.data ?? null,
    error: activeView?.error,
    hasMore: !!activeView?.page?.hasMore && !activeView.error,
    isLoading: key !== null && (!activeView || activeView.loading === 'initial'),
    isLoadingMore: activeView?.loading === 'more',
    initialLoaded: !!activeView && activeView.loading !== 'initial',
    loadMore,
    retry,
  };
}
