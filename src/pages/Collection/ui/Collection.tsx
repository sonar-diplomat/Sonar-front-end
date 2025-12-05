import React, { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from './Collection.module.css';
import { CollectionHeader, CollectionCover, CollectionView, CollectionActions } from '@widgets/CollectionView';
import type { Track } from '@widgets/CollectionView';
import { useGetPlaylistQuery, useGetPlaylistTracksQuery } from '@entities/Playlist/api/rtkApi';
import { useGetAlbumQuery, useGetAlbumTracksQuery } from '@entities/Album/api/rtkApi';
import { usePlayTracks } from '@shared/lib/audio/usePlaybackActions';
import { getImageUrlById } from '@shared/lib/image-utils';
import type { TrackDTO } from '@entities/Music';
import { getArtistNames } from '@widgets/MiniPlayer/lib/utils';

interface CollectionProps {
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
    
    const playTracks = usePlayTracks();

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

    const tracks: Track[] = useMemo(() => {
        if (type === 'playlist' && playlistTracksData) {
            return playlistTracksData.items.map(convertTrackDTOToTrack);
        }
        if (type === 'album' && albumTracksData) {
            return albumTracksData.map(convertTrackDTOToTrack);
        }
        return [];
    }, [type, playlistTracksData, albumTracksData]);
    
    const isLoading = playlistLoading || playlistTracksLoading || albumLoading || albumTracksLoading;
    const hasError = playlistError || albumError;
    
    const handleBackClick = () => {
        navigate(-1);
    };
    
    const handleMenuClick = () => {
        console.log('Menu clicked - open collection options');
    };
    
    const handlePlayClick = () => {
        if (!collectionId) return;
        
        if (type === 'playlist' && playlistTracksData?.items) {
            playTracks(playlistTracksData.items, 0, { type: 'playlist', id: collectionId });
        } else if (type === 'album' && albumTracksData) {
            playTracks(albumTracksData, 0, { type: 'album', id: collectionId });
        }
    };
    
    const handleShuffleClick = () => {
        if (!collectionId) return;
        
        let tracksToShuffle: TrackDTO[] = [];
        if (type === 'playlist' && playlistTracksData?.items) {
            tracksToShuffle = [...playlistTracksData.items];
        } else if (type === 'album' && albumTracksData) {
            tracksToShuffle = [...albumTracksData];
        }

        for (let i = tracksToShuffle.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [tracksToShuffle[i], tracksToShuffle[j]] = [tracksToShuffle[j], tracksToShuffle[i]];
        }
        
        playTracks(tracksToShuffle, 0, { type, id: collectionId });
    };
    
    const handleTrackMenuClick = (trackId: string) => {
        console.log('Track menu clicked:', trackId);
    };
    
    const handleAddClick = () => {
        console.log('Add clicked - add tracks to collection');
    };
    
    const handleEditClick = () => {
        console.log('Edit clicked - edit collection details');
    };
    
    const handleSortClick = () => {
        console.log('Sort clicked - sort tracks');
    };
    
    if (isLoading) {
        return (
            <div className={styles.collection}>
                <div>Loading...</div>
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
                onMenuClick={handleMenuClick}
            />
            <CollectionCover
                imageSrc={collectionData.coverImage}
                onPlayClick={handlePlayClick}
                onShuffleClick={handleShuffleClick}
            />
            <CollectionActions
                onAddClick={handleAddClick}
                onEditClick={handleEditClick}
                onSortClick={handleSortClick}
            />
            <CollectionView
                title="Tracks inside"
                tracks={tracks}
                onTrackMenuClick={handleTrackMenuClick}
            />
        </div>
    );
};
