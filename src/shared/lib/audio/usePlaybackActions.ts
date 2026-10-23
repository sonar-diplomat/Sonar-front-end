import { useCallback } from 'react';

import type { TrackDTO } from '@entities/Music';
import type { CursorPageDTO } from '@entities/Playlist/model/types';
import { apiClient } from '@shared/api/oldBaseApi';
import { API_ENDPOINTS } from '@shared/config';
import { usePlayer } from '@shared/store/features/player';
import { useNotifications } from '@shared/store/notificationStore';
export type CollectionType = 'Playlist' | 'Album' | 'Blend';
export const usePlayTrack = () => usePlayer().playTrack;
export const useAddToQueue = () => usePlayer().addToQueue;
export const usePlayCollection = () => {
    const { setQueue } = usePlayer();
    const { showError } = useNotifications();
    return useCallback(async (type: CollectionType, id: number, startIndex = 0) => {
        const url = type === 'Album' ? API_ENDPOINTS.album.tracks(id) : type === 'Playlist'
            ? API_ENDPOINTS.playlist.tracks(id) : `Blend/${id}/tracks`;
        const response = await apiClient.get<TrackDTO[] | CursorPageDTO<TrackDTO>>(url);
        if (!response.success || !response.data) { showError(response.message || 'Unable to load tracks'); return; }
        const tracks = Array.isArray(response.data) ? response.data : response.data.items;
        if (!tracks.length) { showError('This collection has no tracks yet'); return; }
        setQueue(tracks, startIndex, { type: type.toLowerCase() as 'album' | 'playlist' | 'blend', id });
    }, [setQueue, showError]);
};
export const usePlayTracks = () => {
    const { setQueue } = usePlayer();
    return useCallback((tracks: TrackDTO[], startIndex = 0, collectionContext?: { type: 'playlist' | 'album' | 'blend'; id: number }) => {
        setQueue(tracks, startIndex, collectionContext);
    }, [setQueue]);
};
