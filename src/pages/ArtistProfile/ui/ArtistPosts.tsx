import React, {useMemo} from 'react';
import {useNavigate, useParams, Outlet, useLocation} from 'react-router-dom';
import {Button, PlusIcon} from '@shared/ui';
import {ArtistPostCard} from '@widgets/ArtistMessageCard';
import {useGetArtistPostsQuery} from '@entities/Artist';
import type {ArtistMessage} from '@widgets/ArtistMessageCard';
import styles from './ArtistProfile.module.css';
import {ProfileHeader, type ProfileType} from "@widgets/ProfileHeader";
import type {ViewerType} from "@shared/types";

interface ArtistPostsProps {
    viewerType?: ViewerType,
    profileType?: ProfileType,
    secondaryTab?: string,
    handleTabChange?: (tab: string) => void,
    onBackClick?: () => void,
    onMessageClick?: () => void
}

export const ArtistPosts: React.FC = ({
                                          viewerType,
                                          profileType,
                                          secondaryTab,
                                          handleTabChange,
                                          onBackClick,
                                          onMessageClick
                                      }: ArtistPostsProps
) => {
    const navigate = useNavigate();
    const location = useLocation();
    const {id} = useParams<{ id: string }>();

    const isCreateRoute = location.pathname.includes('/create');

    // Fetch posts from API
    const {
        data: posts,
        isLoading,
        error
    } = useGetArtistPostsQuery(Number(id), {
        skip: !id || isCreateRoute,
    });

    // Convert API posts to ArtistMessage format
    const artistMessages: ArtistMessage[] = useMemo(() => {
        if (!posts) return [];

        return posts.map((post) => ({
            id: post.id.toString(),
            artistName: 'Artist',
            artistImage: 'https://placehold.co/52x52',
            title: post.title,
            timestamp: new Date(post.createdAt).toLocaleDateString(),
            content: post.textContent,
            hasExpandableText: post.textContent.length > 200,
        }));
    }, [posts]);

    const handleCreateNew = () => {
        navigate(`/artist/${id}/posts/create`);
    };

    const handleMessageMenuClick = (messageId: string) => {
        console.log('Menu clicked for message:', messageId);
    };

    const handleLinkClick = (url: string) => {
        console.log('Link clicked:', url);
        window.open(url, '_blank');
    };

    const handleTrackPlay = (messageId: string) => {
        console.log('Play track for message:', messageId);
    };

    if (isCreateRoute) {
        return <Outlet/>;
    }

    if (isLoading) {
        return <div className={styles.messagesView}>Loading posts...</div>;
    }

    if (error) {
        return <div className={styles.messagesView}>Error loading posts</div>;
    }

    return (
        <>
            <ProfileHeader
                viewerType={viewerType}
                profileType={profileType}
                secondaryTab={secondaryTab}
                onTabChange={handleTabChange}
                onBackClick={onBackClick}
                onMessageClick={onMessageClick}
            />
            <div className={styles.messagesView}>
                <Button
                    className={styles.createBtn}
                    icon={<PlusIcon/>}
                    variant="filled"
                    theme="dark"
                    onClick={handleCreateNew}
                >
                    Create New
                </Button>
                {artistMessages.length === 0 ? (
                    <div>No posts yet. Create your first post!</div>
                ) : (
                    artistMessages.map((message) => (
                        <ArtistPostCard
                            key={message.id}
                            message={message}
                            onMenuClick={handleMessageMenuClick}
                            onLinkClick={handleLinkClick}
                            onTrackPlay={handleTrackPlay}
                        />
                    ))
                )}
            </div>
        </>

    );
};