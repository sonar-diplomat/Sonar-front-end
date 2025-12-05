import React, { useState, useMemo, useCallback } from 'react';
import { useDebounce } from '@shared/lib/hooks/useDebounce';
import { getImageUrlById } from '@shared/lib/image-utils';
import { useUserState } from '@shared/store/features/userState/useUserState';
import { ItemCard } from '@shared/ui';
import type { Category } from '@widgets/ChipsBar';
import { ContentSections, type ContentSection } from '@widgets/ContentSections';
import { SearchFilterHeader } from '@widgets/SearchFilterHeader';
import {
  useSearchQuery,
  useSearchTracksQuery,
  useSearchPlaylistsQuery,
  useSearchArtistsQuery,
  useSearchUsersQuery,
} from '@shared/api';
import type {
  TrackSearchItemDTO,
  AlbumSearchItemDTO,
  PlaylistSearchItemDTO,
  ArtistSearchItemDTO,
  UserSearchItemDTO,
  SearchResultDTO,
} from '@entities/Search';

import styles from './Search.module.css';

export const Search: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<Category>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const debouncedSearchQuery = useDebounce(searchQuery, 500);
  const { updateListeningTarget } = useUserState();

  // Определяем, нужно ли выполнять поиск
  const shouldSearch = debouncedSearchQuery.trim().length > 0;

  // Основной поиск для категории "All"
  const {
    data: searchData,
    isLoading: isSearchLoading,
    error: searchError,
  } = useSearchQuery(
    {
      query: debouncedSearchQuery,
      category: 'All',
      limit: 20,
    },
    { skip: !shouldSearch || selectedCategory !== 'All' }
  );

  // Поиск по категориям
  const {
    data: tracksData,
    isLoading: isTracksLoading,
  } = useSearchTracksQuery(
    { query: debouncedSearchQuery, limit: 20 },
    { skip: !shouldSearch || selectedCategory !== 'Radio' }
  );

  const {
    data: playlistsData,
    isLoading: isPlaylistsLoading,
  } = useSearchPlaylistsQuery(
    { query: debouncedSearchQuery, limit: 20 },
    { skip: !shouldSearch || selectedCategory !== 'Playlists' }
  );

  const {
    data: artistsData,
    isLoading: isArtistsLoading,
  } = useSearchArtistsQuery(
    { query: debouncedSearchQuery, limit: 20 },
    { skip: !shouldSearch || selectedCategory !== 'Creators' }
  );

  const {
    data: usersData,
    isLoading: isUsersLoading,
  } = useSearchUsersQuery(
    { query: debouncedSearchQuery, limit: 20 },
    { skip: !shouldSearch || selectedCategory !== 'Creators' }
  );

  // Определяем данные в зависимости от категории
  const getDataForCategory = (): SearchResultDTO | null => {
    if (!shouldSearch) return null;

    switch (selectedCategory) {
      case 'All':
        return searchData || null;
      case 'Radio':
        return tracksData ? { query: debouncedSearchQuery, totalResults: tracksData.total, tracks: tracksData } : null;
      case 'Playlists':
        return playlistsData ? { query: debouncedSearchQuery, totalResults: playlistsData.total, playlists: playlistsData } : null;
      case 'Creators':
        const creatorsTotal = (artistsData?.total || 0) + (usersData?.total || 0);
        return artistsData && usersData
          ? {
              query: debouncedSearchQuery,
              totalResults: creatorsTotal,
              artists: artistsData,
              users: usersData,
            }
          : null;
      default:
        return null;
    }
  };

  const currentData = getDataForCategory();
  const isLoading =
    isSearchLoading ||
    isTracksLoading ||
    isPlaylistsLoading ||
    isArtistsLoading ||
    isUsersLoading;

  // Обработчики кликов
  const handleTrackClick = useCallback(async (track: TrackSearchItemDTO) => {
    try {
      // Устанавливаем трек как текущий для воспроизведения
      // UserStatePlayerSync автоматически загрузит трек и запустит его в плеере
      await updateListeningTarget(track.id);
      console.log('Listening target updated, track will start playing:', track.id);
    } catch (error) {
      console.error('Failed to start track:', error);
    }
  }, [updateListeningTarget]);

  const handleAlbumClick = useCallback((album: AlbumSearchItemDTO) => {
    console.log('Opening album:', album);
    // TODO: Navigate to album page when routing is implemented
  }, []);

  const handlePlaylistClick = useCallback((playlist: PlaylistSearchItemDTO) => {
    console.log('Opening playlist:', playlist);
    // TODO: Navigate to playlist page when routing is implemented
  }, []);

  const handleArtistClick = useCallback((artist: ArtistSearchItemDTO) => {
    console.log('Opening artist:', artist);
    // TODO: Navigate to artist page when routing is implemented
  }, []);

  const handleUserClick = useCallback((user: UserSearchItemDTO) => {
    console.log('Opening user:', user);
    // TODO: Navigate to user page when routing is implemented
  }, []);

  // Формирование секций для отображения
  const sections = useMemo<ContentSection[]>(() => {
    if (!currentData || !shouldSearch) {
      return [];
    }

    const result: ContentSection[] = [];

    // Секция треков (для All и Radio)
    if (
      (selectedCategory === 'All' && currentData.tracks) ||
      (selectedCategory === 'Radio' && tracksData)
    ) {
      const tracks = selectedCategory === 'All' ? currentData.tracks?.items : tracksData?.items;
      if (tracks && tracks.length > 0) {
        result.push({
          id: 'tracks',
          title: 'Tracks',
          countLabel: 'tracks',
          shouldShow: selectedCategory === 'All' || selectedCategory === 'Radio',
          items: tracks,
          renderItem: (track: TrackSearchItemDTO) => (
            <ItemCard
              size="large"
              key={track.id}
              image={getImageUrlById(track.coverId)}
              textContent={{
                title: track.title,
                subtitle1: track.artists.map((a) => a.pseudonym).join(', '),
                subtitle2: track.albumName,
              }}
              onClick={() => handleTrackClick(track)}
            />
          ),
        });
      }
    }

    // Секция альбомов (только для All)
    if (selectedCategory === 'All' && currentData?.albums && currentData.albums.items.length > 0) {
      result.push({
        id: 'albums',
        title: 'Albums',
        countLabel: 'albums',
        shouldShow: true,
        items: currentData.albums.items,
        renderItem: (album: AlbumSearchItemDTO) => (
          <ItemCard
            size="large"
            key={album.id}
            image={getImageUrlById(album.coverId)}
            textContent={{
              title: album.name,
              subtitle1: album.authors.map((a) => a.pseudonym).join(', '),
              subtitle2: `${album.trackCount} tracks`,
            }}
            to={`/collection/${album.id}`}
            state={{ collectionType: 'Album' }}
            onClick={() => handleAlbumClick(album)}
          />
        ),
      });
    }

    // Секция плейлистов
    if (
      (selectedCategory === 'All' && currentData.playlists) ||
      (selectedCategory === 'Playlists' && playlistsData)
    ) {
      const playlists =
        selectedCategory === 'All' ? currentData.playlists?.items : playlistsData?.items;
      if (playlists && playlists.length > 0) {
        result.push({
          id: 'playlists',
          title: 'Playlists',
          countLabel: 'playlists',
          shouldShow: selectedCategory === 'All' || selectedCategory === 'Playlists',
          items: playlists,
          renderItem: (playlist: PlaylistSearchItemDTO) => (
            <ItemCard
              size="large"
              key={playlist.id}
              image={getImageUrlById(playlist.coverId)}
              textContent={{
                title: playlist.name,
                subtitle1: `by ${playlist.creatorName}`,
                subtitle2: `${playlist.trackCount} tracks`,
              }}
              to={`/collection/${playlist.id}`}
              state={{ collectionType: 'Playlist' }}
              onClick={() => handlePlaylistClick(playlist)}
            />
          ),
        });
      }
    }

    // Секция артистов (для All и Creators)
    if (
      (selectedCategory === 'All' && currentData.artists) ||
      (selectedCategory === 'Creators' && artistsData)
    ) {
      const artists =
        selectedCategory === 'All' ? currentData.artists?.items : artistsData?.items;
      if (artists && artists.length > 0) {
        result.push({
          id: 'artists',
          title: 'Artists',
          countLabel: 'artists',
          shouldShow: selectedCategory === 'All' || selectedCategory === 'Creators',
          items: artists,
          renderItem: (artist: ArtistSearchItemDTO) => (
            <ItemCard
              size="large"
              key={artist.id}
              image={getImageUrlById(artist.avatarImageId)}
              textContent={{
                title: artist.artistName,
                subtitle1: `${artist.trackCount} tracks, ${artist.albumCount} albums`,
              }}
              onClick={() => handleArtistClick(artist)}
            />
          ),
        });
      }
    }

    // Секция пользователей (для All и Creators)
    if (
      (selectedCategory === 'All' && currentData.users) ||
      (selectedCategory === 'Creators' && usersData)
    ) {
      const users = selectedCategory === 'All' ? currentData.users?.items : usersData?.items;
      if (users && users.length > 0) {
        result.push({
          id: 'users',
          title: 'Users',
          countLabel: 'users',
          shouldShow: selectedCategory === 'All' || selectedCategory === 'Creators',
          items: users,
          renderItem: (user: UserSearchItemDTO) => (
            <ItemCard
              size="large"
              key={user.id}
              image={getImageUrlById(user.avatarImageId)}
              textContent={{
                title: user.userName,
                subtitle1: user.isArtist ? `Artist: ${user.artistName}` : user.publicIdentifier,
              }}
              onClick={() => handleUserClick(user)}
            />
          ),
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
    <div className={styles.container}>
      <SearchFilterHeader
        title="Search"
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        searchValue={searchQuery}
        onSearch={handleSearch}
        searchPlaceholder="Search for tracks, albums, playlists, artists..."
      />
      {isLoading && shouldSearch && (
        <div className={styles.loading}>Loading...</div>
      )}
      {searchError && (
        <div className={styles.error}>
          Error:{' '}
          {searchError &&
          'data' in searchError &&
          searchError.data &&
          'message' in searchError.data
            ? searchError.data.message
            : 'Failed to search'}
        </div>
      )}
      {!shouldSearch && (
        <div className={styles.emptyState}>
          Enter a search query to find tracks, albums, playlists, artists, and users
        </div>
      )}
      {shouldSearch && !isLoading && sections.length === 0 && (
        <div className={styles.emptyState}>No results found</div>
      )}
      {shouldSearch && !isLoading && sections.length > 0 && (
        <ContentSections sections={sections} />
      )}
    </div>
  );
};
