import React, { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ProfileCard } from '@shared/ui';
import { ProfileLayout } from '@widgets/ProfileLayout';
import { ContentSections } from '@widgets/ContentSections';
import { ArtistMessageCard } from '@widgets/ArtistMessageCard';
import { ProfileActionButtons } from '@widgets/ProfileActionButtons';
import { useProfileNavigation } from '@shared/hooks';
import { getMockPlaylists, getMockArtistMessages } from '@shared/lib/mocks';
import { createPlaylistSection } from '@shared/lib/profile';
import type { ViewerType } from '@shared/types';
import styles from './ArtistProfile.module.css';

interface ArtistProfileProps {
    viewerType?: ViewerType;
}

export const ArtistProfile: React.FC<ArtistProfileProps> = ({
    viewerType = 'guest'
}) => {
    const { id } = useParams<{ id: string }>();
    const { handleBackClick } = useProfileNavigation();

    const [playlists] = useState(getMockPlaylists);
    const [artistMessages] = useState(getMockArtistMessages);

    const sections = useMemo(() => [createPlaylistSection(playlists)], [playlists]);

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

    const profileCard = (
        <ProfileCard
            isVerified
            name="Moody"
            monthlyListeners={18200000}
            src="https://placehold.co/378x264"
            alt="profileImage"
        />
    );

    const actionButtons = (
        <ProfileActionButtons viewerType={viewerType} profileType="artist" />
    );

    const profileView = (
        <>
            <ContentSections sections={sections} />
            <ProfileCard
                variant="bio"
                isVerified
                title="About the Artist"
                bio="Electronic music producer and DJ creating atmospheric soundscapes. Touring worldwide and releasing music since 2018."
                src="https://placehold.co/378x264"
                alt="profileImage"
            />
        </>
    );

    const postsView = (
        <div className={styles.messagesView}>
            {artistMessages.map((message) => (
                <ArtistMessageCard
                    key={message.id}
                    message={message}
                    onMenuClick={handleMessageMenuClick}
                    onLinkClick={handleLinkClick}
                    onTrackPlay={handleTrackPlay}
                />
            ))}
        </div>
    );

    return (
        <ProfileLayout
            secondaryTab="Posts"
            onBackClick={handleBackClick}
            profileCard={profileCard}
            actionButtons={actionButtons}
            profileView={profileView}
            secondaryView={postsView}
        />
    );
};