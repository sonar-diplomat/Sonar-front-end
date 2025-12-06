import React, { useState, useMemo, useCallback } from 'react';
import { useDebounce } from '@shared/lib/hooks/useDebounce';
import { getImageUrlById } from '@shared/lib/image-utils';
import { useUserState } from '@shared/store/features/userState/useUserState';
import { ItemCard, LoadingPlaceholder } from '@shared/ui';
import type { Category } from '@widgets/ChipsBar';
import { ContentSections, type ContentSection } from '@widgets/ContentSections';
import { SearchFilterHeader } from '@widgets/SearchFilterHeader';
import {
  useSearchTracks,
  useSearchAlbums,
  useSearchPlaylists,
  useSearchArtists,
  useSearchUsers,
} from '@shared/store/features/search/useSearch';
import { useSearchQuery } from '@shared/api';
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

  // Используем новые хуки с кэшированием для всех категорий
  const tracksResult = useSearchTracks(debouncedSearchQuery, 20);
  const playlistsResult = useSearchPlaylists(debouncedSearchQuery, 20);
  const artistsResult = useSearchArtists(debouncedSearchQuery, 20);
  const usersResult = useSearchUsers(debouncedSearchQuery, 20);
  const albumsResult = useSearchAlbums(debouncedSearchQuery, 20);

  // Для категории "All" используем общий поиск, но также используем кэш из отдельных хуков
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

  // Подготавливаем данные для категорий
  const tracksData = selectedCategory === 'Radio' || selectedCategory === 'All' 
    ? { items: tracksResult.tracks, total: tracksResult.tracks.length } 
    : null;
  const playlistsData = selectedCategory === 'Playlists' || selectedCategory === 'All'
    ? { items: playlistsResult.playlists, total: playlistsResult.playlists.length }
    : null;
  const artistsData = selectedCategory === 'Creators' || selectedCategory === 'All'
    ? { items: artistsResult.artists, total: artistsResult.artists.length }
    : null;
  const usersData = selectedCategory === 'Creators' || selectedCategory === 'All'
    ? { items: usersResult.users, total: usersResult.users.length }
    : null;
  const albumsData = selectedCategory === 'All'
    ? { items: albumsResult.albums, total: albumsResult.albums.length }
    : null;

  // Определяем данные в зависимости от категории
  // Для категории "All" используем данные из общего поиска, но объединяем с кэшем
  const getDataForCategory = (): SearchResultDTO | null => {
    if (!shouldSearch) return null;

    switch (selectedCategory) {
      case 'All': {
        // Для "All" используем данные из общего поиска, если они есть и соответствуют текущему запросу
        // Если данных из API еще нет, показываем кэш из отдельных хуков
        if (searchData && searchData.query === debouncedSearchQuery) {
          // Данные из API соответствуют текущему запросу - используем их
          // Объединяем с кэшем из отдельных хуков для полноты
          const hasCache = tracksData || playlistsData || artistsData || usersData || albumsData;
          
          if (hasCache) {
            // Объединяем результаты из API с кэшем, приоритет у данных из API
            return {
              query: debouncedSearchQuery,
              totalResults: searchData.totalResults,
              tracks: searchData.tracks || tracksData || undefined,
              albums: searchData.albums || albumsData || undefined,
              playlists: searchData.playlists || playlistsData || undefined,
              artists: searchData.artists || artistsData || undefined,
              users: searchData.users || usersData || undefined,
            };
          }
          
          // Если кэша нет, используем только данные из API
          return searchData;
        }
        
        // Если данных из API нет или они не соответствуют текущему запросу, показываем кэш
        const hasCache = tracksData || playlistsData || artistsData || usersData || albumsData;
        if (hasCache) {
          return {
            query: debouncedSearchQuery,
            totalResults: (tracksData?.total || 0) + (albumsData?.total || 0) + (playlistsData?.total || 0) + (artistsData?.total || 0) + (usersData?.total || 0),
            tracks: tracksData || undefined,
            albums: albumsData || undefined,
            playlists: playlistsData || undefined,
            artists: artistsData || undefined,
            users: usersData || undefined,
          };
        }
        
        return null;
      }
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
  const isLoading = isSearchLoading || 
    tracksResult.isLoading || 
    playlistsResult.isLoading || 
    artistsResult.isLoading || 
    usersResult.isLoading ||
    albumsResult.isLoading;

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

    // Секция альбомов (только для All)
    if (selectedCategory === 'All' && currentData?.albums && currentData.albums.items.length > 0) {
        result.push({
          id: 'albums',
          title: 'Albums',
          countLabel: 'albums',
          shouldShow: true,
          items: currentData.albums.items,
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
        <LoadingPlaceholder variant="spinner" fullWidth />
      )}
      {(searchError || tracksResult.error || playlistsResult.error || artistsResult.error || usersResult.error) && (
        <div className={styles.error}>
          Error: Failed to search
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
