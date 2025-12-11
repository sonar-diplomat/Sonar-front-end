import React, { useState } from 'react';
import { useNavigate, useParams, Outlet, useLocation } from 'react-router-dom';
import { Button, PlusIcon } from '@shared/ui';
import { ArtistPostCard } from '@widgets/ArtistMessageCard';
import { getMockArtistMessages } from '@shared/lib/mocks';
import styles from './ArtistProfile.module.css';

export const ArtistPosts: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { id } = useParams<{ id: string }>();
    const [artistMessages] = useState(getMockArtistMessages);

    // Check if we're on the create route
    const isCreateRoute = location.pathname.includes('/create');

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
        return <Outlet />;
    }

    return (
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
            {artistMessages.map((message) => (
                <ArtistPostCard
                    key={message.id}
                    message={message}
                    onMenuClick={handleMessageMenuClick}
                    onLinkClick={handleLinkClick}
                    onTrackPlay={handleTrackPlay}
                />
            ))}
        </div>
    );
};