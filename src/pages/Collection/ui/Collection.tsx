import React, { useMemo } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import styles from './Collection.module.css';
import { CollectionHeader, CollectionCover, CollectionView, CollectionActions } from '@widgets/CollectionView';
import type { Track } from '@widgets/CollectionView';
import { useGetPlaylistQuery, useGetPlaylistTracksQuery } from '@entities/Playlist/api/rtkApi';
import { useGetAlbumTracksQuery } from '@entities/Album/api/rtkApi';
import { usePlayTracks } from '@shared/lib/audio/usePlaybackActions';
import { getImageUrlById } from '@shared/lib/image-utils';
import type { TrackDTO } from '@entities/Music';
import { getArtistNames } from '@widgets/MiniPlayer/lib/utils';

type CollectionType = 'Playlist' | 'Album' | 'Blend';

/**
 * Converts TrackDTO to Track format for CollectionView
 */
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

export const Collection: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    
    // Get collection type from navigation state, default to 'Playlist'
    const collectionType = (location.state?.collectionType as CollectionType) || 'Playlist';
    const collectionId = id ? Number.parseInt(id, 10) : null;
    
    const playTracks = usePlayTracks();
    
    // Load playlist data if type is Playlist
    const { data: playlistData, isLoading: playlistLoading, error: playlistError } = useGetPlaylistQuery(
        collectionId!,
        { skip: !collectionId || collectionType !== 'Playlist' }
    );
    
    // Load playlist tracks if type is Playlist
    const { data: playlistTracksData, isLoading: playlistTracksLoading } = useGetPlaylistTracksQuery(
        collectionId!,
        { skip: !collectionId || collectionType !== 'Playlist' }
    );
    
    // Load album tracks if type is Album
    const { data: albumTracksData, isLoading: albumTracksLoading } = useGetAlbumTracksQuery(
        collectionId!,
        { skip: !collectionId || collectionType !== 'Album' }
    );
    
    // Determine collection data based on type
    const collectionData = useMemo(() => {
        if (collectionType === 'Playlist' && playlistData) {
            return {
                title: playlistData.name,
                coverImage: playlistData.cover?.url || getImageUrlById(playlistData.coverId),
            };
        }
        // For Album, we don't have album data endpoint, so we'll use tracks data
        if (collectionType === 'Album' && albumTracksData && albumTracksData.length > 0) {
            // Use first track's cover as collection cover
            const firstTrack = albumTracksData[0];
            return {
                title: 'Album', // TODO: Get album name from somewhere
                coverImage: firstTrack.cover?.url || getImageUrlById(firstTrack.coverId),
            };
        }
        return {
            title: 'Collection',
            coverImage: undefined,
        };
    }, [collectionType, playlistData, albumTracksData]);
    
    // Convert tracks to CollectionView format
    const tracks: Track[] = useMemo(() => {
        if (collectionType === 'Playlist' && playlistTracksData) {
            return playlistTracksData.items.map(convertTrackDTOToTrack);
        }
        if (collectionType === 'Album' && albumTracksData) {
            return albumTracksData.map(convertTrackDTOToTrack);
        }
        return [];
    }, [collectionType, playlistTracksData, albumTracksData]);
    
    const isLoading = playlistLoading || playlistTracksLoading || albumTracksLoading;
    const hasError = playlistError;
    
    const handleBackClick = () => {
        navigate(-1);
    };
    
    const handleMenuClick = () => {
        console.log('Menu clicked - open collection options');
    };
    
    const handlePlayClick = () => {
        if (!collectionId) return;
        
        if (collectionType === 'Playlist' && playlistTracksData?.items) {
            playTracks(playlistTracksData.items, 0, { type: 'playlist', id: collectionId });
        } else if (collectionType === 'Album' && albumTracksData) {
            playTracks(albumTracksData, 0, { type: 'album', id: collectionId });
        }
    };
    
    const handleShuffleClick = () => {
        if (!collectionId) return;
        
        let tracksToShuffle: TrackDTO[] = [];
        if (collectionType === 'Playlist' && playlistTracksData?.items) {
            tracksToShuffle = [...playlistTracksData.items];
        } else if (collectionType === 'Album' && albumTracksData) {
            tracksToShuffle = [...albumTracksData];
        }
        
        // Shuffle tracks
        for (let i = tracksToShuffle.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [tracksToShuffle[i], tracksToShuffle[j]] = [tracksToShuffle[j], tracksToShuffle[i]];
        }
        
        playTracks(tracksToShuffle, 0, { type: collectionType.toLowerCase() as 'playlist' | 'album' | 'blend', id: collectionId });
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
