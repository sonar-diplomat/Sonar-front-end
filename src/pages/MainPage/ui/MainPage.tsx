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
    MOCK_LISTEN_NOW_ITEMS,
    MOCK_RECENTLY_PLAYED_TRACKS,
    MOCK_RECENTLY_PLAYED_PLAYLISTS,
} from './mocks';
import styles from './MainPage.module.css';

export const MainPage: React.FC = () => {
    const navigate = useNavigate();
    const currentUserId = useCurrentUserId();
    const { data: currentUser } = useGetUserByIdQuery(currentUserId!, {
        skip: !currentUserId,
    });
    const { data: currentUserProfile } = useGetUserProfileByIdentifierQuery(
        currentUser?.publicIdentifier || '',
        {
            skip: !currentUser?.publicIdentifier,
        }
    );
    const { library } = useUserLibrary();

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

    const handleListenNowClick = (item: typeof MOCK_LISTEN_NOW_ITEMS[0]) => {
        if (item.type === 'playlist') {
            navigate(`/playlist/${item.id}`);
        } else {
            navigate(`/album/${item.id}`);
        }
    };

    const recentlyPlayedTracks = useMemo(() => {
        return MOCK_RECENTLY_PLAYED_TRACKS.slice(0, 12);
    }, []);

    const recentlyPlayedPlaylists = useMemo(() => {
        return MOCK_RECENTLY_PLAYED_PLAYLISTS.slice(0, 12);
    }, []);

    const handleRecentlyPlayedTrackClick = (item: typeof MOCK_RECENTLY_PLAYED_TRACKS[0]) => {
        navigate(`/player/${item.id}`);
    };

    const handleRecentlyPlayedPlaylistClick = (item: typeof MOCK_RECENTLY_PLAYED_PLAYLISTS[0]) => {
        navigate(`/playlist/${item.id}`);
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

            <div className={styles.section}>
                <h2 className={styles.sectionTitle}>Listen now</h2>
                <div className={styles.listenNowGrid}>
                    {MOCK_LISTEN_NOW_ITEMS.map((item) => (
                        <ItemCard
                            key={item.id}
                            size="large"
                            image={getImageUrlById(item.coverId)}
                            textContent={{
                                title: item.name,
                            }}
                            onClick={() => handleListenNowClick(item)}
                        />
                    ))}
                </div>
            </div>

            <div className={styles.section}>
                <GetPremiumCard onClick={() => navigate('/premium')} />
            </div>

            <div className={styles.section}>
                <div className={styles.recentlyPlayedHeader}>
                    <div className={styles.recentlyPlayedHeaderLeft}>
                        <h2 className={styles.recentlyPlayedTitle}>Recently played</h2>
                        <span className={styles.recentlyPlayedCount}>{recentlyPlayedTracks.length} Tracks</span>
                    </div>
                    {recentlyPlayedTracks.length >= 12 && (
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
                        {recentlyPlayedTracks.map((item) => (
                            <ItemCard
                                key={item.id}
                                size="medium"
                                image={getImageUrlById(item.coverId)}
                                textContent={{
                                    title: item.title,
                                    subtitle1: item.artistName,
                                }}
                                onClick={() => handleRecentlyPlayedTrackClick(item)}
                            />
                        ))}
                    </div>
                </div>
            </div>

            <div className={styles.section}>
                <div className={styles.recentlyPlayedHeader}>
                    <div className={styles.recentlyPlayedHeaderLeft}>
                        <h2 className={styles.recentlyPlayedTitle}>Recently played</h2>
                        <span className={styles.recentlyPlayedCount}>{recentlyPlayedPlaylists.length} Playlists</span>
                    </div>
                    {recentlyPlayedPlaylists.length >= 12 && (
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
                        {recentlyPlayedPlaylists.map((item) => (
                            <ItemCard
                                key={item.id}
                                size="medium"
                                image={getImageUrlById(item.coverId)}
                                textContent={{
                                    title: item.title,
                                    subtitle1: item.artistName,
                                }}
                                onClick={() => handleRecentlyPlayedPlaylistClick(item)}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

