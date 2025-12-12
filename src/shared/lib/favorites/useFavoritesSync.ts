import { useEffect } from 'react';
import { useUserLibrary } from '@shared/lib/user-hooks/useUserLibrary';
import { useGetPlaylistTracksQuery } from '@entities/Playlist/api/rtkApi';
import { usePlayer } from '@shared/store/features/player';
import { useAppSelector } from '@shared/store/hooks';

/**
 * Хук для синхронизации избранных треков из плейлиста favorites с store
 */
export const useFavoritesSync = () => {
    const { isAuthenticated } = useAppSelector((state) => state.auth);
    const { library } = useUserLibrary();
    const { setFavoriteTracks } = usePlayer();

    // Находим плейлист favorites
    const favoritesPlaylist = library?.playlists?.find(
        (playlist) => {
            const playlistName = playlist.name?.toLowerCase().trim();
            return playlistName === 'favorites' || playlistName === 'избранное';
        }
    );

    const { data: favoritesTracksData } = useGetPlaylistTracksQuery(favoritesPlaylist?.id || 0, {
        skip: !isAuthenticated || !favoritesPlaylist?.id,
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
