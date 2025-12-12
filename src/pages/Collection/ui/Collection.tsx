import React, { useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from './Collection.module.css';
import {
    CollectionHeader,
    CollectionCover,
    CollectionView,
    CollectionActions,
    CollectionPlayPanel
} from '@widgets/CollectionView';
import type { Track } from '@widgets/CollectionView';
import { useGetPlaylistQuery, useGetPlaylistTracksQuery } from '@entities/Playlist/api/rtkApi';
import { useGetAlbumQuery, useGetAlbumTracksQuery } from '@entities/Album/api/rtkApi';
import { usePlayTracks } from '@shared/lib/audio/usePlaybackActions';
import { getImageUrlById } from '@shared/lib/image-utils';
import type { TrackDTO } from '@entities/Music';
import { getArtistNames } from '@widgets/MiniPlayer/lib/utils';
import {ActionMenu, LoadingPlaceholder} from '@shared/ui';
import { usePlayer } from '@shared/store/features/player';

export interface CollectionProps {
    type: 'playlist' | 'album';
}

const convertTrackDTOToTrack = (trackDTO: TrackDTO): Track => {
    const artistName = getArtistNames(trackDTO);
    const coverUrl = trackDTO.cover?.url || getImageUrlById(trackDTO.coverId);
    
    return {
        id: String(trackDTO.id),
        title: trackDTO.title,
        artist: artistName,
        imageSrc: coverUrl,
        imageAlt: trackDTO.title,
    };
};

export const Collection: React.FC<CollectionProps> = ({ type }) => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const collectionId = id ? Number.parseInt(id, 10) : null;
    
    const [sortBy, setSortBy] = useState<'none' | 'title' | 'artist'>('none');
    const [actionMenuContext, setActionMenuContext] = useState<import('@shared/ui').ActionMenuContext | null>(null);

    const playTracks = usePlayTracks();
    const { play, togglePlayPause, isPlaying, collectionContext } = usePlayer();

    // Check if this collection is currently being played
    const isCurrentCollection = useMemo(() => {
        if (!collectionId || !collectionContext) return false;
        return collectionContext.type === type && collectionContext.id === collectionId;
    }, [collectionId, collectionContext, type]);

    const { data: playlistData, isLoading: playlistLoading, error: playlistError } = useGetPlaylistQuery(
        collectionId!,
        { skip: !collectionId || type !== 'playlist' }
    );

    const { data: playlistTracksData, isLoading: playlistTracksLoading } = useGetPlaylistTracksQuery(
        collectionId!,
        { skip: !collectionId || type !== 'playlist' }
    );

    const { data: albumData, isLoading: albumLoading, error: albumError } = useGetAlbumQuery(
        collectionId!,
        { skip: !collectionId || type !== 'album' }
    );

    const { data: albumTracksData, isLoading: albumTracksLoading } = useGetAlbumTracksQuery(
        collectionId!,
        { skip: !collectionId || type !== 'album' }
    );

    const collectionData = useMemo(() => {
        if (type === 'playlist' && playlistData) {
            return {
                title: playlistData.name,
                coverImage: getImageUrlById(playlistData.coverId),
            };
        }
        if (type === 'album' && albumData) {
            return {
                title: albumData.name,
                coverImage: getImageUrlById(albumData.coverId),
            };
        }
        return {
            title: type === 'playlist' ? 'Playlist' : 'Album',
            coverImage: undefined,
        };
    }, [type, playlistData, albumData]);

    // Проверяем, является ли плейлист favorites
    const isFavoritesPlaylist = useMemo(() => {
        if (type === 'playlist' && collectionData.title) {
            const playlistName = collectionData.title.toLowerCase().trim();
            return playlistName === 'favorites' || playlistName === 'избранное';
        }
        return false;
    }, [type, collectionData.title]);

    const tracks: Track[] = useMemo(() => {
        let trackList: Track[] = [];
        if (type === 'playlist' && playlistTracksData) {
            trackList = playlistTracksData.items.map(convertTrackDTOToTrack);
        } else if (type === 'album' && albumTracksData) {
            trackList = albumTracksData.map(convertTrackDTOToTrack);
        }

        if (sortBy === 'title') {
            trackList = [...trackList].sort((a, b) => a.title.localeCompare(b.title));
        } else if (sortBy === 'artist') {
            trackList = [...trackList].sort((a, b) => a.artist.localeCompare(b.artist));
        }

        return trackList;
    }, [type, playlistTracksData, albumTracksData, sortBy]);

    const rawTracks: TrackDTO[] = useMemo(() => {
        if (type === 'playlist' && playlistTracksData) {
            return playlistTracksData.items;
        }
        if (type === 'album' && albumTracksData) {
            return albumTracksData;
        }
        return [];
    }, [type, playlistTracksData, albumTracksData]);
    
    const isLoading = playlistLoading || playlistTracksLoading || albumLoading || albumTracksLoading;
    const hasError = playlistError || albumError;
    
    const handleBackClick = () => {
        navigate(-1);
    };
    
    const handleMenuClick = () => {
        if (!collectionId) return;
        setActionMenuContext({
            type,
            entityId: collectionId,
            entityName: collectionData.title,
        });
    };

    const handleCloseActionMenu = () => {
        setActionMenuContext(null);
    };

    const handlePlayClick = () => {
        if (isCurrentCollection) {
            togglePlayPause();
            return;
        }

        if (!collectionId || rawTracks.length === 0) return;

        let tracksToPlay = [...rawTracks];
        if (sortBy === 'title') {
            tracksToPlay.sort((a, b) => a.title.localeCompare(b.title));
        } else if (sortBy === 'artist') {
            tracksToPlay.sort((a, b) => getArtistNames(a).localeCompare(getArtistNames(b)));
        }

        playTracks(tracksToPlay, 0, { type, id: collectionId });
        play();
    };
    
    const handleShuffleClick = () => {
        if (!collectionId || rawTracks.length === 0) return;

        let tracksToShuffle = [...rawTracks];
        if (sortBy === 'title') {
            tracksToShuffle.sort((a, b) => a.title.localeCompare(b.title));
        } else if (sortBy === 'artist') {
            tracksToShuffle.sort((a, b) => getArtistNames(a).localeCompare(getArtistNames(b)));
        }

        for (let i = tracksToShuffle.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [tracksToShuffle[i], tracksToShuffle[j]] = [tracksToShuffle[j], tracksToShuffle[i]];
        }
        
        playTracks(tracksToShuffle, 0, { type, id: collectionId });
        play();
    };

    const handleTrackClick = (trackId: string) => {
        if (!collectionId || rawTracks.length === 0) return;

        let tracksToPlay = [...rawTracks];
        if (sortBy === 'title') {
            tracksToPlay.sort((a, b) => a.title.localeCompare(b.title));
        } else if (sortBy === 'artist') {
            tracksToPlay.sort((a, b) => getArtistNames(a).localeCompare(getArtistNames(b)));
        }

        const trackIndex = tracksToPlay.findIndex(t => String(t.id) === trackId);
        if (trackIndex !== -1) {
            playTracks(tracksToPlay, trackIndex, { type, id: collectionId });
            play();
        }
    };
    
    const handleTrackMenuClick = (trackId: string) => {
        const track = tracks.find(t => t.id === trackId);
        if (!track) return;

        setActionMenuContext({
            type: 'track',
            entityId: Number(trackId),
            entityName: track.title,
        });
    };

    const handleEditClick = () => {
        console.log('Edit clicked - edit collection details');
    };
    
    const handleSortClick = () => {
        if (sortBy === 'none') {
            setSortBy('title');
        } else if (sortBy === 'title') {
            setSortBy('artist');
        } else {
            setSortBy('none');
        }
    };
    
    if (isLoading) {
        return (
            <div className={styles.collection}>
                <LoadingPlaceholder variant="spinner" text="Loading..." fullWidth />
            </div>
        );
    }
    
    if (hasError) {
        return (
            <div className={styles.collection}>
                <div>Error loading collection</div>
            </div>
        );
    }
    
    return (
        <div className={styles.collection}>
            <CollectionHeader
                title={collectionData.title}
                onBackClick={handleBackClick}
                onMenuClick={isFavoritesPlaylist ? undefined : handleMenuClick}
            />
            <CollectionCover
                imageSrc={collectionData.coverImage}
            />
            <CollectionPlayPanel
                onPlayClick={handlePlayClick}
                onShuffleClick={handleShuffleClick}
                isPlaying={isPlaying}
                isCurrentCollection={isCurrentCollection}
            />
            <CollectionActions
                onEditClick={handleEditClick}
                onSortClick={handleSortClick}
                sortBy={sortBy}
            />
            <CollectionView
                title="Tracks inside"
                tracks={tracks}
                onTrackClick={handleTrackClick}
                onTrackMenuClick={handleTrackMenuClick}
            />
            {actionMenuContext && (
                <ActionMenu
                    isOpen={true}
                    onClose={handleCloseActionMenu}
                    context={actionMenuContext}
                />
            )}
        </div>
    );
};
