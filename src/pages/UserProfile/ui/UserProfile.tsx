import React, { useMemo, useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { ProfileCard } from '@shared/ui';
import { ProfileLayout } from '@widgets/ProfileLayout';
import { ContentSections } from '@widgets/ContentSections';
import { TopSongsWidget } from '@widgets/TopSongsWidget';
import { TopArtistsWidget } from '@widgets/TopArtistsWidget';
import { ProfileActionButtons } from '@widgets/ProfileActionButtons';
import { FollowersFollowingModal } from '@widgets/FollowersFollowingModal';
import { MarkdownRenderer } from '@shared/lib/markdown/MarkdownRenderer';
import { useProfileNavigation } from '@shared/hooks';
import { createPlaylistSection } from '@shared/lib/profile';
import { getImageUrl } from '@shared/lib/image-utils';
import { useCurrentUserId } from '@shared/lib/auth/useCurrentUserId';
import { 
    useGetUserProfileByIdentifierQuery,
    useGetUserByIdQuery,
    useGetFollowersQuery,
    useGetFriendsQuery,
    useFollowUserMutation,
    useUnfollowUserMutation,
    useGetTopTracksQuery,
    useGetTopArtistsQuery,
} from '@entities/User/api/rtkApi';
import { useCreateChatMutation, useGetChatsQuery } from '@entities/Chat/api/rtkApi';
import { useNavigate } from 'react-router-dom';
import { UserProfileSkeleton } from './UserProfileSkeleton';
import { UserNotFound } from './UserNotFound';
import type { ViewerType } from '@shared/types';
import styles from './UserProfile.module.css';

interface UserProfileProps {
    viewerType?: ViewerType;
}

export const UserProfile: React.FC<UserProfileProps> = ({
    viewerType: initialViewerType
}) => {
    const { identifier } = useParams<{ identifier: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    const { handleBackClick, handleNavigateToLibrary } = useProfileNavigation();
    const currentUserId = useCurrentUserId();

    const isIdentifierValid = identifier !== null && identifier !== undefined && identifier.length > 0;

    const { 
        data: profileData, 
        isLoading: isLoadingProfile, 
        error: profileError 
    } = useGetUserProfileByIdentifierQuery(identifier!, {
        skip: !isIdentifierValid,
    });

    const { data: currentUserData } = useGetUserByIdQuery(currentUserId!, {
        skip: !currentUserId,
    });

    const viewerType: ViewerType = useMemo(() => {
        if (initialViewerType) return initialViewerType;
        if (currentUserData && profileData && currentUserData.publicIdentifier === profileData.publicIdentifier) {
            return 'owner';
        }
        return 'guest';
    }, [initialViewerType, currentUserData, profileData]);

    // Redirect to correct URL if viewing own profile with outdated identifier
    useEffect(() => {
        // Check sessionStorage for updated identifier (set when user updates it in settings)
        const updatedIdentifier = sessionStorage.getItem('updatedPublicIdentifier');
        const oldIdentifier = sessionStorage.getItem('oldPublicIdentifier');
        
        if (updatedIdentifier && oldIdentifier && identifier === oldIdentifier) {
            // Clear sessionStorage and redirect to new identifier
            sessionStorage.removeItem('updatedPublicIdentifier');
            sessionStorage.removeItem('oldPublicIdentifier');
            navigate(`/user/${updatedIdentifier}`, { replace: true });
            return;
        }
        
        // Fallback: check if current identifier doesn't match current user's identifier
        if (
            viewerType === 'owner' &&
            currentUserData?.publicIdentifier &&
            identifier &&
            identifier !== currentUserData.publicIdentifier
        ) {
            // Redirect to correct profile URL with new identifier
            navigate(`/user/${currentUserData.publicIdentifier}`, { replace: true });
        }
    }, [viewerType, currentUserData?.publicIdentifier, identifier, navigate]);

    // Check if current user is following the profile user (only for guest view)
    const { data: followersData, refetch: refetchFollowers } = useGetFollowersQuery(profileData?.id || 0, {
        skip: !profileData?.id || !currentUserId || viewerType === 'owner',
    });

    // Check if users are friends (mutual follows)
    const { data: friendsData } = useGetFriendsQuery(undefined, {
        skip: !currentUserId || !profileData?.id || viewerType === 'owner',
    });

    // Get user's chats to check for existing personal chat
    const { data: userChats, refetch: refetchChats } = useGetChatsQuery(undefined, {
        skip: !currentUserId || viewerType === 'owner',
    });

    // Get top tracks and artists (only for owner)
    const { 
        data: topTracksData, 
        isLoading: isLoadingTopTracks,
        isError: isTopTracksError,
        refetch: refetchTopTracks
    } = useGetTopTracksQuery(undefined, {
        skip: viewerType !== 'owner',
    });

    const { 
        data: topArtistsData,
        isLoading: isLoadingTopArtists,
        isError: isTopArtistsError,
        refetch: refetchTopArtists
    } = useGetTopArtistsQuery(undefined, {
        skip: viewerType !== 'owner',
    });

    // Check if current user is following the profile user
    const isFollowing = useMemo(() => {
        if (!followersData || !currentUserId) return false;
        return followersData.items.some(follower => follower.id === currentUserId);
    }, [followersData, currentUserId]);

    // Check if users are friends
    const isFriend = useMemo(() => {
        if (!friendsData || !profileData) return false;
        return friendsData.some(friend => friend.id === profileData.id);
    }, [friendsData, profileData]);

    const [followUser, { isLoading: isFollowingLoading }] = useFollowUserMutation();
    const [unfollowUser, { isLoading: isUnfollowingLoading }] = useUnfollowUserMutation();
    const [createChat, { isLoading: isCreatingChat }] = useCreateChatMutation();

    const handleFollow = async () => {
        if (!profileData?.id) return;
        try {
            await followUser(profileData.id).unwrap();
            if (refetchFollowers) {
                await refetchFollowers();
            }
        } catch (error) {
            console.error('Failed to follow user:', error);
        }
    };

    const handleUnfollow = async () => {
        if (!profileData?.id) return;
        try {
            await unfollowUser(profileData.id).unwrap();
            if (refetchFollowers) {
                await refetchFollowers();
            }
        } catch (error) {
            console.error('Failed to unfollow user:', error);
        }
    };

    const handleCreateChat = async () => {
        if (!profileData?.id || !currentUserId) return;
        
        // Check if personal chat already exists between current user and profile user
        const existingChat = userChats?.find(chat => {
            if (chat.isGroup) return false;
            if (chat.userIds.length !== 2) return false;
            return chat.userIds.includes(currentUserId) && chat.userIds.includes(profileData.id);
        });
        
        if (existingChat) {
            // Navigate to existing chat
            navigate(`/chats/${existingChat.id}`);
            return;
        }
        
        try {
            await createChat({
                name: profileData.userName,
                isGroup: false,
                coverId: 1,
                userId: profileData.id,
            }).unwrap();    
            navigate('/chats');
        } catch (error: any) {
            if (error?.data?.message?.includes('already exists') || error?.status === 400) {
                const updatedChats = await refetchChats();
                const foundChat = updatedChats.data?.find(chat => {
                    if (chat.isGroup) return false;
                    if (chat.userIds.length !== 2) return false;
                    return chat.userIds.includes(currentUserId) && chat.userIds.includes(profileData.id);
                });
                if (foundChat) {
                    navigate(`/chats/${foundChat.id}`);
                } else {
                    navigate('/chats');
                }
            } else {
                console.error('Failed to create chat:', error);
            }
        }
    };

    const [modalType, setModalType] = useState<'followers' | 'following' | null>(null);

    // Transform API data to widget format
    const topSongs = useMemo(() => {
        if (!topTracksData) return [];
        return topTracksData.map(track => ({
            id: track.id.toString(),
            trackId: track.id,
            title: track.title,
            artist: track.artists.map(a => a.pseudonym).join(', '),
            imageSrc: getImageUrl(track.coverId) || '',
            imageAlt: track.title
        }));
    }, [topTracksData]);

    const topArtists = useMemo(() => {
        if (!topArtistsData) return [];
        return topArtistsData.map(artist => ({
            id: artist.id.toString(),
            name: artist.artistName,
            imageSrc: getImageUrl(artist.avatarImageId || 0) || '',
            imageAlt: artist.artistName
        }));
    }, [topArtistsData]);

    // Transform UserPlaylistDTO[] to Playlist[] format
    const playlists = useMemo(() => {
        if (!profileData?.publicPlaylists) return [];
        return profileData.publicPlaylists.map(playlist => ({
            id: playlist.id.toString(),
            name: playlist.name,
            coverImage: getImageUrl(playlist.coverId),
            trackCount: playlist.trackCount,
            type: 'Playlist' as const,
        }));
    }, [profileData?.publicPlaylists]);

    const sections = useMemo(() => [createPlaylistSection(playlists)], [playlists]);

    if (profileError && 'status' in profileError && profileError.status === 404) {
        return <UserNotFound />;
    }

    if (isLoadingProfile || !profileData) {
        return <UserProfileSkeleton />;
    }

    const avatarUrl = profileData.imageUrl || getImageUrl(profileData.avatarImageId) || 'https://placehold.co/378x264';

    const stats = {
        followers: profileData.followersCount,
        following: profileData.followingCount,
        publicPlaylists: profileData.publicPlaylists?.length || 0,
    };

    const isVerified = profileData.accessFeatures?.some(
        (feature) => feature.name?.toLowerCase().includes('verified')
    ) ?? false;

    const handleTabChange = (tab: string) => {
        if (tab === 'library') {
            handleNavigateToLibrary();
        }
    };

    const handleFollowersClick = () => {
        if (profileData?.id) {
            setModalType('followers');
        }
    };

    const handleFollowingClick = () => {
        if (profileData?.id) {
            setModalType('following');
        }
    };

    const handleCloseModal = () => {
        setModalType(null);
    };

    const profileCard = (
        <ProfileCard
            isVerified={isVerified}
            name={profileData.userName || 'User'}
            stats={stats}
            src={avatarUrl}
            alt="profileImage"
            onFollowersClick={handleFollowersClick}
            onFollowingClick={handleFollowingClick}
        />
    );

    const actionButtons = viewerType === 'owner' ? null : (
        <ProfileActionButtons 
            viewerType={viewerType} 
            profileType="user"
            isFollowing={isFollowing}
            isFriend={isFriend}
            onFollow={handleFollow}
            onUnfollow={handleUnfollow}
            onCreateChat={handleCreateChat}
            isLoading={isFollowingLoading || isUnfollowingLoading || isCreatingChat}
        />
    );

    const bioSection = profileData.biography ? (
        <div className={styles.bioSection}>
            <h3 className={styles.bioLabel}>About</h3>
            <MarkdownRenderer content={profileData.biography} className={styles.bioText} />
        </div>
    ) : null;

    const profileView = (
        <>
            <ContentSections sections={sections} />
            <div className={styles.widgetsContainer}>
                <div className={styles.topRow}>
                    {bioSection}
                    {(viewerType === 'owner') && (
                        <TopSongsWidget
                            songs={topSongs}
                            isLoading={isLoadingTopTracks}
                            error={isTopTracksError}
                            onRetry={refetchTopTracks}
                            dateRange=""
                        />
                    )}
                </div>
                <div className={styles.bottomRow}>
                    {(viewerType === 'owner') && (
                        <TopArtistsWidget
                            artists={topArtists}
                            isLoading={isLoadingTopArtists}
                            error={isTopArtistsError}
                            onRetry={refetchTopArtists}
                            dateRange=""
                        />
                    )}
                </div>
            </div>
        </>
    );

    const handleMessageClick = () => {
        // Pass current profile path in state so we can return here from chats
        navigate('/chats', { state: { from: location.pathname } });
    };

    const handleSettingsClick = () => {
        navigate('/settings');
    };

    return (
        <>
            <ProfileLayout
                viewerType={viewerType}
                profileType="user"
                secondaryTab="Library"
                onBackClick={handleBackClick}
                onTabChange={handleTabChange}
                onMessageClick={handleMessageClick}
                onSettingsClick={handleSettingsClick}
                profileCard={profileCard}
                actionButtons={actionButtons}
                profileView={profileView}
            />
            {profileData?.id && modalType && (
                <FollowersFollowingModal
                    isOpen={modalType !== null}
                    onClose={handleCloseModal}
                    userId={profileData.id}
                    type={modalType}
                />
            )}
        </>
    );
};
