import { useEffect } from 'react';
import { useUserLibrary } from '@shared/lib/user-hooks/useUserLibrary';
import { useGetPlaylistTracksQuery } from '@entities/Playlist/api/rtkApi';
import { usePlayer } from '@shared/store/features/player';

/**
 * Хук для синхронизации избранных треков из плейлиста favorites с store
 */
export const useFavoritesSync = () => {
    const { library } = useUserLibrary();
    const { setFavoriteTracks } = usePlayer();

    // Находим плейлист favorites
    const favoritesPlaylist = library?.playlists?.find(
        (playlist) => {
            const playlistName = playlist.name?.toLowerCase().trim();
            return playlistName === 'favorites' || playlistName === 'избранное';
        }
    );

    // Загружаем треки из плейлиста favorites
    const { data: favoritesTracksData } = useGetPlaylistTracksQuery(favoritesPlaylist?.id || 0, {
        skip: !favoritesPlaylist?.id,
    });

    // Синхронизируем favoriteTrackIds с треками из плейлиста favorites
    useEffect(() => {
        // Если плейлист favorites найден и данные загружены, синхронизируем
        if (favoritesPlaylist?.id && favoritesTracksData !== undefined) {
            const favoriteTrackIds = favoritesTracksData.items?.map(track => track.id) || [];
            console.log('[useFavoritesSync] Syncing favorites:', {
                playlistId: favoritesPlaylist.id,
                playlistName: favoritesPlaylist.name,
                trackCount: favoriteTrackIds.length,
                trackIds: favoriteTrackIds
            });
            setFavoriteTracks(favoriteTrackIds);
        }
    }, [favoritesPlaylist?.id, favoritesTracksData, setFavoriteTracks]);
};
