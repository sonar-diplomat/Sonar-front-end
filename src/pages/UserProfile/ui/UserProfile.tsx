import React, { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ProfileCard } from '@shared/ui';
import { ProfileLayout } from '@widgets/ProfileLayout';
import { ContentSections } from '@widgets/ContentSections';
import { TopSongsWidget } from '@widgets/TopSongsWidget';
import { TopArtistsWidget } from '@widgets/TopArtistsWidget';
import { ProfileActionButtons } from '@widgets/ProfileActionButtons';
import { FollowersFollowingModal } from '@widgets/FollowersFollowingModal';
import { MarkdownRenderer } from '@shared/lib/markdown/MarkdownRenderer';
import { useProfileNavigation } from '@shared/hooks';
import { getMockTopSongs, getMockTopArtists } from '@shared/lib/mocks';
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

    const [topSongs] = useState(getMockTopSongs);
    const [topArtists] = useState(getMockTopArtists);
    const [modalType, setModalType] = useState<'followers' | 'following' | null>(null);

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
                    <TopSongsWidget
                        songs={topSongs}
                        dateRange="Nov 10 –16"
                        onSongMenuClick={(songId) => console.log('Menu clicked for song:', songId)}
                    />
                </div>
                <div className={styles.bottomRow}>
                    <TopArtistsWidget
                        artists={topArtists}
                        dateRange="Nov 10 –16"
                    />
                </div>
            </div>
        </>
    );

    const handleMessageClick = () => {
        navigate('/chats');
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