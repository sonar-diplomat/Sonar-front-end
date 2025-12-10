import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDebounce } from '@shared/lib/hooks/useDebounce';
import { getImageUrlById } from '@shared/lib/image-utils';
import { useUserState } from '@shared/store/features/userState/useUserState';
import { ItemCard, LoadingPlaceholder } from '@shared/ui';
import type { Category } from '@widgets/ChipsBar';
import { ContentSections, type ContentSection } from '@widgets/ContentSections';
import { SearchFilterHeader } from '@widgets/SearchFilterHeader';
import { useLazySearchQuery } from '@shared/api';
import type {
  TrackSearchItemDTO,
  AlbumSearchItemDTO,
  PlaylistSearchItemDTO,
  ArtistSearchItemDTO,
  UserSearchItemDTO,
  SearchResultDTO,
  SearchCategory,
} from '@entities/Search';

import styles from './Search.module.css';

export const Search: React.FC = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<Category>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const debouncedSearchQuery = useDebounce(searchQuery, 500);
  const { updateListeningTarget } = useUserState();
  const scrollRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const PAGE_SIZE = 20;
  const [fetchSearch] = useLazySearchQuery();

  const [searchData, setSearchData] = useState<SearchResultDTO | null>(null);
  const [isSearchLoading, setIsSearchLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [offset, setOffset] = useState(0);

  const shouldSearch = debouncedSearchQuery.trim().length > 0;

  const getBackendCategory = (category: Category): SearchCategory | undefined =>
    category === 'All' ? undefined : (category as SearchCategory);

  // reset on new query/category
  useEffect(() => {
    setSearchData(null);
    setHasMore(false);
    setOffset(0);
    setSearchError(null);
  }, [debouncedSearchQuery, selectedCategory]);

  const loadPage = useCallback(
    async (nextOffset: number) => {
      if (!shouldSearch) return;
      if (nextOffset === 0) {
        setIsSearchLoading(true);
        setSearchError(null);
      } else {
        setIsLoadingMore(true);
      }
      try {
        const res = await fetchSearch({
          query: debouncedSearchQuery,
          category: getBackendCategory(selectedCategory),
          limit: PAGE_SIZE,
          offset: nextOffset,
        }).unwrap();

        setSearchData((prev) => {
          const prevTracks = prev?.tracks?.items ?? [];
          const prevAlbums = prev?.albums?.items ?? [];
          const prevPlaylists = prev?.playlists?.items ?? [];
          const prevArtists = prev?.artists?.items ?? [];
          const prevUsers = prev?.users?.items ?? [];

          const mergedTracks = nextOffset === 0 ? res.tracks?.items ?? [] : [...prevTracks, ...(res.tracks?.items ?? [])];
          const mergedAlbums = nextOffset === 0 ? res.albums?.items ?? [] : [...prevAlbums, ...(res.albums?.items ?? [])];
          const mergedPlaylists = nextOffset === 0 ? res.playlists?.items ?? [] : [...prevPlaylists, ...(res.playlists?.items ?? [])];
          const mergedArtists = nextOffset === 0 ? res.artists?.items ?? [] : [...prevArtists, ...(res.artists?.items ?? [])];
          const mergedUsers = nextOffset === 0 ? res.users?.items ?? [] : [...prevUsers, ...(res.users?.items ?? [])];

          const mergedCount =
            mergedTracks.length + mergedAlbums.length + mergedPlaylists.length + mergedArtists.length + mergedUsers.length;
          const totalResults =
            res.totalResults ??
            mergedTracks.length + mergedAlbums.length + mergedPlaylists.length + mergedArtists.length + mergedUsers.length;

          setHasMore(mergedCount < totalResults);
          setOffset(nextOffset + PAGE_SIZE);

          return {
            query: res.query,
            totalResults,
            tracks: res.tracks ? { total: res.tracks.total, items: mergedTracks } : prev?.tracks,
            albums: res.albums ? { total: res.albums.total, items: mergedAlbums } : prev?.albums,
            playlists: res.playlists ? { total: res.playlists.total, items: mergedPlaylists } : prev?.playlists,
            artists: res.artists ? { total: res.artists.total, items: mergedArtists } : prev?.artists,
            users: res.users ? { total: res.users.total, items: mergedUsers } : prev?.users,
          };
        });
      } catch (e: any) {
        setSearchError(e?.data?.message || e?.message || 'Search failed');
        setHasMore(false);
      } finally {
        setIsSearchLoading(false);
        setIsLoadingMore(false);
      }
    },
    [shouldSearch, fetchSearch, debouncedSearchQuery, selectedCategory, PAGE_SIZE]
  );

  // initial load
  useEffect(() => {
    if (!shouldSearch) return;
    void loadPage(0);
  }, [shouldSearch, loadPage]);

  // infinite scroll через IntersectionObserver
  useEffect(() => {
    if (!hasMore || isLoadingMore || isSearchLoading) return;

    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const root =
      (scrollRef.current?.closest('.scrollableContent') as HTMLElement | null) ||
      scrollRef.current ||
      null;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry.isIntersecting) return;

        if (hasMore && !isLoadingMore && !isSearchLoading) {
          void loadPage(offset);
        }
      },
      {
        root: root ?? null,
        rootMargin: '0px 0px 200px 0px',
        threshold: 0.1,
      }
    );

    observer.observe(sentinel);

    return () => {
      observer.disconnect();
    };
  }, [hasMore, isLoadingMore, isSearchLoading, loadPage, offset]);

  const tracksData =
    (selectedCategory === 'Tracks' || selectedCategory === 'All') && searchData?.tracks
      ? { items: searchData.tracks.items, total: searchData.tracks.total }
      : null;
  const playlistsData =
    (selectedCategory === 'Playlists' || selectedCategory === 'All') && searchData?.playlists
      ? { items: searchData.playlists.items, total: searchData.playlists.total }
      : null;
  const artistsData =
    (selectedCategory === 'Artists' || selectedCategory === 'All') && searchData?.artists
      ? { items: searchData.artists.items, total: searchData.artists.total }
      : null;
  const usersData =
    (selectedCategory === 'Users' || selectedCategory === 'All') && searchData?.users
      ? { items: searchData.users.items, total: searchData.users.total }
      : null;
  const albumsData =
    (selectedCategory === 'Albums' || selectedCategory === 'All') && searchData?.albums
      ? { items: searchData.albums.items, total: searchData.albums.total }
      : null;

  const getDataForCategory = (): SearchResultDTO | null => {
    if (!shouldSearch) return null;

    switch (selectedCategory) {
      case 'All':
        return searchData && searchData.query === debouncedSearchQuery ? searchData : null;
      case 'Tracks':
        return tracksData ? { query: debouncedSearchQuery, totalResults: tracksData.total, tracks: tracksData } : null;
      case 'Albums':
        return albumsData ? { query: debouncedSearchQuery, totalResults: albumsData.total, albums: albumsData } : null;
      case 'Playlists':
        return playlistsData
          ? { query: debouncedSearchQuery, totalResults: playlistsData.total, playlists: playlistsData }
          : null;
      case 'Artists':
        return artistsData ? { query: debouncedSearchQuery, totalResults: artistsData.total, artists: artistsData } : null;
      case 'Users':
        return usersData ? { query: debouncedSearchQuery, totalResults: usersData.total, users: usersData } : null;
      default:
        return null;
    }
  };

  const currentData = getDataForCategory();
  const isLoading = isSearchLoading;

  const handleTrackClick = useCallback(
    async (track: TrackSearchItemDTO) => {
      try {
        await updateListeningTarget(track.id);
      } catch (error) {
        console.error('Failed to start track:', error);
      }
    },
    [updateListeningTarget]
  );

  const handleAlbumClick = useCallback((album: AlbumSearchItemDTO) => {
    console.log('Opening album:', album);
  }, []);

  const handlePlaylistClick = useCallback((playlist: PlaylistSearchItemDTO) => {
    console.log('Opening playlist:', playlist);
  }, []);

  const handleArtistClick = useCallback((artist: ArtistSearchItemDTO) => {
    console.log('Opening artist:', artist);
  }, []);

  const handleUserClick = useCallback(
    (user: UserSearchItemDTO) => {
      navigate(`/user/${user.publicIdentifier}`);
    },
    [navigate]
  );

  const sections = useMemo<ContentSection[]>(() => {
    if (!currentData || !shouldSearch) {
      return [];
    }

    const result: ContentSection[] = [];

    if ((selectedCategory === 'All' && currentData.tracks) || (selectedCategory === 'Tracks' && tracksData)) {
      const tracks = selectedCategory === 'All' ? currentData.tracks?.items : tracksData?.items;
      if (tracks && tracks.length > 0) {
        result.push({
          id: 'tracks',
          title: 'Tracks',
          countLabel: 'tracks',
          shouldShow: selectedCategory === 'All' || selectedCategory === 'Tracks',
          items: tracks,
          renderItem: (track: unknown) => {
            const trackItem = track as TrackSearchItemDTO;
            return (
              <ItemCard
                size="large"
                key={trackItem.id}
                image={getImageUrlById(trackItem.coverId)}
                textContent={{
                  title: trackItem.title,
                  subtitle1: trackItem.artists.map((a) => a.pseudonym).join(', '),
                  subtitle2: trackItem.albumName,
                }}
                onClick={() => handleTrackClick(trackItem)}
              />
            );
          },
        });
      }
    }

    if (
      (selectedCategory === 'All' && currentData?.albums && currentData.albums.items.length > 0) ||
      (selectedCategory === 'Albums' && albumsData && albumsData.items.length > 0)
    ) {
      const albums = selectedCategory === 'All' ? currentData.albums?.items : albumsData?.items;
      if (albums && albums.length > 0) {
        result.push({
          id: 'albums',
          title: 'Albums',
          countLabel: 'albums',
          shouldShow: selectedCategory === 'All' || selectedCategory === 'Albums',
          items: albums,
          renderItem: (album: unknown) => {
            const albumItem = album as AlbumSearchItemDTO;
            return (
              <ItemCard
                size="large"
                key={albumItem.id}
                image={getImageUrlById(albumItem.coverId)}
                textContent={{
                  title: albumItem.name,
                  subtitle1: albumItem.authors.map((a) => a.pseudonym).join(', '),
                  subtitle2: `${albumItem.trackCount} tracks`,
                }}
                to={`/album/${albumItem.id}`}
                onClick={() => handleAlbumClick(albumItem)}
              />
            );
          },
        });
      }
    }

    if ((selectedCategory === 'All' && currentData.playlists) || (selectedCategory === 'Playlists' && playlistsData)) {
      const playlists = selectedCategory === 'All' ? currentData.playlists?.items : playlistsData?.items;
      if (playlists && playlists.length > 0) {
        result.push({
          id: 'playlists',
          title: 'Playlists',
          countLabel: 'playlists',
          shouldShow: selectedCategory === 'All' || selectedCategory === 'Playlists',
          items: playlists,
          renderItem: (playlist: unknown) => {
            const playlistItem = playlist as PlaylistSearchItemDTO;
            return (
              <ItemCard
                size="large"
                key={playlistItem.id}
                image={getImageUrlById(playlistItem.coverId)}
                textContent={{
                  title: playlistItem.name,
                  subtitle1: `by ${playlistItem.creatorName}`,
                  subtitle2: `${playlistItem.trackCount} tracks`,
                }}
                to={`/playlist/${playlistItem.id}`}
                onClick={() => handlePlaylistClick(playlistItem)}
              />
            );
          },
        });
      }
    }

    if ((selectedCategory === 'All' && currentData.artists) || (selectedCategory === 'Artists' && artistsData)) {
      const artists = selectedCategory === 'All' ? currentData.artists?.items : artistsData?.items;
      if (artists && artists.length > 0) {
        result.push({
          id: 'artists',
          title: 'Artists',
          countLabel: 'artists',
          shouldShow: selectedCategory === 'All' || selectedCategory === 'Artists',
          items: artists,
          renderItem: (artist: unknown) => {
            const artistItem = artist as ArtistSearchItemDTO;
            return (
              <ItemCard
                size="large"
                key={artistItem.id}
                image={getImageUrlById(artistItem.avatarImageId)}
                textContent={{
                  title: artistItem.artistName,
                  subtitle1: `${artistItem.trackCount} tracks, ${artistItem.albumCount} albums`,
                }}
                onClick={() => handleArtistClick(artistItem)}
              />
            );
          },
        });
      }
    }

    if ((selectedCategory === 'All' && currentData.users) || (selectedCategory === 'Users' && usersData)) {
      const users = selectedCategory === 'All' ? currentData.users?.items : usersData?.items;
      if (users && users.length > 0) {
        result.push({
          id: 'users',
          title: 'Users',
          countLabel: 'users',
          shouldShow: selectedCategory === 'All' || selectedCategory === 'Users',
          items: users,
          renderItem: (user: unknown) => {
            const userItem = user as UserSearchItemDTO;
            return (
              <ItemCard
                size="large"
                key={userItem.id}
                image={getImageUrlById(userItem.avatarImageId)}
                textContent={{
                  title: userItem.userName,
                  subtitle1: userItem.isArtist ? `Artist: ${userItem.artistName}` : userItem.publicIdentifier,
                }}
                onClick={() => handleUserClick(userItem)}
              />
            );
          },
        });
      }
    }

    return result;
  }, [
    currentData,
    selectedCategory,
    shouldSearch,
    tracksData,
    playlistsData,
    artistsData,
    usersData,
    albumsData,
    handleTrackClick,
    handleAlbumClick,
    handlePlaylistClick,
    handleArtistClick,
    handleUserClick,
  ]);

  const handleSearch = useCallback((value: string) => {
    setSearchQuery(value);
  }, []);

  return (
    <div className={styles.container} ref={scrollRef}>
      <SearchFilterHeader
        title="Search"
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        searchValue={searchQuery}
        onSearch={handleSearch}
        searchPlaceholder="Search for tracks, albums, playlists, artists..."
      />
      {isLoading && shouldSearch && <LoadingPlaceholder variant="spinner" fullWidth />}
      {searchError && <div className={styles.error}>Error: Failed to search</div>}
      {!shouldSearch && (
        <div className={styles.emptyState}>
          Enter a search query to find tracks, albums, playlists, artists, and users
        </div>
      )}
      {shouldSearch && !isLoading && sections.length === 0 && (
        <div className={styles.emptyState}>No results found</div>
      )}
      {shouldSearch && !isLoading && sections.length > 0 && <ContentSections sections={sections} />}

      {/* маячок для infinite scroll */}
      <div ref={sentinelRef} />

      {isLoadingMore && <LoadingPlaceholder variant="spinner" fullWidth />}
    </div>
  );
};

