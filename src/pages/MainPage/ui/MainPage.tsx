import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ItemCard, Button } from '@shared/ui';
import { ItemCardContainer } from '@shared/ui/ItemCard';
import { useCurrentUserId } from '@shared/lib/auth/useCurrentUserId';
import { useGetUserByIdQuery, useGetUserProfileByIdentifierQuery } from '@entities/User/api/rtkApi';
import { useUserLibrary } from '@shared/lib/user-hooks/useUserLibrary';
import { getImageUrlById } from '@shared/lib/image-utils';
import { GetPremiumCard } from '@widgets/GetPremium';
import {
    useGetPopularCollectionsQuery,
    useGetRecentCollectionsQuery,
    useGetRecentTracksQuery,
} from '@entities/Recommendations';
import { useGetAlbumQuery } from '@entities/Album/api/rtkApi';
import { useGetPlaylistQuery } from '@entities/Playlist/api/rtkApi';
import { useGetTrackQuery } from '@entities/Music/api/rtkApi';
import { getArtistNames } from '@widgets/MiniPlayer/lib/utils';
import { usePlayer } from '@shared/store/features/player';
import { MainPageSkeleton } from './MainPageSkeleton';
import styles from './MainPage.module.css';

export const MainPage: React.FC = () => {
    const navigate = useNavigate();
    const currentUserId = useCurrentUserId();
    const { data: currentUser, isLoading: isLoadingUser } = useGetUserByIdQuery(currentUserId!, {
        skip: !currentUserId,
    });
    const { data: currentUserProfile, isLoading: isLoadingUserProfile } = useGetUserProfileByIdentifierQuery(
        currentUser?.publicIdentifier || '',
        {
            skip: !currentUser?.publicIdentifier,
        }
    );
    const { library, isLoading: isLoadingLibrary } = useUserLibrary();

    // Fetch recommendations
    const { data: popularCollections, isLoading: isLoadingPopularCollections } = useGetPopularCollectionsQuery({ limit: 6 });
    const { data: recentCollections, isLoading: isLoadingRecentCollections } = useGetRecentCollectionsQuery(
        { limit: 12 },
        { skip: !currentUserId }
    );
    const { data: recentTracks, isLoading: isLoadingRecentTracks } = useGetRecentTracksQuery(
        { limit: 12 },
        { skip: !currentUserId }
    );

    // All hooks must be called before any conditional returns
    const userName = useMemo(() => {
        if (currentUserProfile?.userName) {
            return currentUserProfile.userName;
        }
        if (currentUser?.publicIdentifier) {
            return currentUser.publicIdentifier;
        }
        return 'User';
    }, [currentUserProfile, currentUser]);

    const quickStartPlaylists = useMemo(() => {
        if (!library?.playlists) return [];
        return library.playlists.slice(0, 8).map((playlist) => ({
            id: playlist.id,
            name: playlist.name,
            coverImage: getImageUrlById(playlist.coverId),
        }));
    }, [library]);

    // Check if initial critical data is loading
    // Show skeleton only when loading critical data that affects page structure
    // Popular collections is the main content, so we wait for it
    const isLoadingCritical = isLoadingPopularCollections;

    // Show skeleton while loading initial critical data
    if (isLoadingCritical) {
        return <MainPageSkeleton />;
    }

    // Collection type enum values (matching backend CollectionType)
    const CollectionType = {
        CollectionUnknown: 0,
        CollectionAlbum: 1,
        CollectionPlaylist: 2,
    } as const;

    const handleCollectionClick = (collectionId: number, collectionType: number) => {
        if (collectionType === CollectionType.CollectionAlbum) {
            navigate(`/album/${collectionId}`);
        } else if (collectionType === CollectionType.CollectionPlaylist) {
            navigate(`/playlist/${collectionId}`);
        }
    };

    const handleTrackClick = () => {
        // Навигация обрабатывается в TrackCard, где также запускается воспроизведение
    };

    return (
        <div className={styles.container}>
            <div className={styles.welcomeSection}>
                <p className={styles.welcomeText}>Welcome back!</p>
                <h1 className={styles.userName}>{userName}</h1>
            </div>

            {quickStartPlaylists.length > 0 && (
                <div className={styles.section}>
                    <ItemCardContainer
                        title="Quick start"
                        count={quickStartPlaylists.length}
                        countLabel="playlists"
                    >
                        {quickStartPlaylists.map((playlist) => (
                            <ItemCard
                                key={playlist.id}
                                size="small"
                                image={playlist.coverImage}
                                textContent={{
                                    title: playlist.name,
                                }}
                                to={`/playlist/${playlist.id}`}
                                collectionId={playlist.id}
                                collectionName={playlist.name}
                            />
                        ))}
                    </ItemCardContainer>
                </div>
            )}

            {popularCollections && popularCollections.length > 0 && (
                <div className={styles.section}>
                    <div className={styles.recentlyPlayedHeader}>
                        <div className={styles.recentlyPlayedHeaderLeft}>
                            <h2 className={styles.recentlyPlayedTitle}>Listen now</h2>
                            <span className={styles.recentlyPlayedCount}>{popularCollections.length} Collections</span>
                        </div>
                    </div>
                    <div className={styles.cardsScroll}>
                        <div className={styles.cardsRow}>
                            {popularCollections.map((collection) => (
                                <CollectionCard
                                    key={`${collection.collectionType}-${collection.collectionId}`}
                                    collectionId={collection.collectionId}
                                    collectionType={collection.collectionType}
                                    size="large"
                                    onClick={() => handleCollectionClick(collection.collectionId, collection.collectionType)}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            )}

            <div className={styles.section}>
                <GetPremiumCard onClick={() => navigate('/premium')} />
            </div>

            {recentTracks && recentTracks.items.length > 0 && (
                <div className={styles.section}>
                    <div className={styles.recentlyPlayedHeader}>
                        <div className={styles.recentlyPlayedHeaderLeft}>
                            <h2 className={styles.recentlyPlayedTitle}>Recently played</h2>
                            <span className={styles.recentlyPlayedCount}>{recentTracks.items.length} Tracks</span>
                        </div>
                        {recentTracks.items.length >= 12 && (
                            <Button
                                variant="text"
                                theme="dark"
                                className={styles.seeMoreButton}
                                onClick={() => navigate('/library')}
                            >
                                → see all
                            </Button>
                        )}
                    </div>
                    <div className={styles.cardsScroll}>
                        <div className={styles.cardsRow}>
                            {recentTracks.items.map((track) => (
                                <TrackCard
                                    key={track.trackId}
                                    trackId={track.trackId}
                                    onClick={handleTrackClick}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {recentCollections && recentCollections.items.length > 0 && (
                <div className={styles.section}>
                    <div className={styles.recentlyPlayedHeader}>
                        <div className={styles.recentlyPlayedHeaderLeft}>
                            <h2 className={styles.recentlyPlayedTitle}>Recently played</h2>
                            <span className={styles.recentlyPlayedCount}>{recentCollections.items.length} Collections</span>
                        </div>
                        {recentCollections.items.length >= 12 && (
                            <Button
                                variant="text"
                                theme="dark"
                                className={styles.seeMoreButton}
                                onClick={() => navigate('/library')}
                            >
                                → see all
                            </Button>
                        )}
                    </div>
                    <div className={styles.cardsScroll}>
                        <div className={styles.cardsRow}>
                            {recentCollections.items.map((collection) => (
                                <CollectionCard
                                    key={`${collection.collectionType}-${collection.collectionId}`}
                                    collectionId={collection.collectionId}
                                    collectionType={collection.collectionType}
                                    onClick={() => handleCollectionClick(collection.collectionId, collection.collectionType)}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// Helper component to load and display collection details
const CollectionCard: React.FC<{
    collectionId: number;
    collectionType: number;
    size?: 'small' | 'medium' | 'large';
    onClick: () => void;
}> = ({ collectionId, collectionType, size = 'medium', onClick }) => {
    const CollectionType = {
        CollectionUnknown: 0,
        CollectionAlbum: 1,
        CollectionPlaylist: 2,
    } as const;

    const { data: album } = useGetAlbumQuery(collectionId, {
        skip: collectionType !== CollectionType.CollectionAlbum,
    });
    const { data: playlist } = useGetPlaylistQuery(collectionId, {
        skip: collectionType !== CollectionType.CollectionPlaylist,
    });

    const collection = collectionType === CollectionType.CollectionAlbum ? album : playlist;
    const imageUrl = collection?.coverId ? getImageUrlById(collection.coverId) : undefined;
    const title = collection?.name || 'Unknown';

    return (
        <ItemCard
            size={size}
            image={imageUrl}
            textContent={{
                title,
            }}
            onClick={onClick}
        />
    );
};

// Helper component to load and display track details
const TrackCard: React.FC<{
    trackId: number;
    onClick: () => void;
}> = ({ trackId, onClick }) => {
    const { data: track } = useGetTrackQuery(trackId);
    const { playTrack } = usePlayer();
    
    if (!track) {
        return null;
    }

    const artistName = getArtistNames(track);
    const imageUrl = track.coverId ? getImageUrlById(track.coverId) : undefined;

    const handleClick = () => {
        playTrack(track);
        onClick();
    };

    return (
        <ItemCard
            size="medium"
            image={imageUrl}
            textContent={{
                title: track.title,
                subtitle1: artistName,
            }}
            onClick={handleClick}
        />
    );
};

