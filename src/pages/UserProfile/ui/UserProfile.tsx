import React, { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ProfileCard } from '@shared/ui';
import { ProfileLayout } from '@widgets/ProfileLayout';
import { ContentSections } from '@widgets/ContentSections';
import { TopSongsWidget } from '@widgets/TopSongsWidget';
import { TopArtistsWidget } from '@widgets/TopArtistsWidget';
import { ProfileActionButtons } from '@widgets/ProfileActionButtons';
import { useProfileNavigation } from '@shared/hooks';
import { getMockPlaylists, getMockTopSongs, getMockTopArtists } from '@shared/lib/mocks';
import { createPlaylistSection } from '@shared/lib/profile';
import type { ViewerType } from '@shared/types';

interface UserProfileProps {
    viewerType?: ViewerType;
}

export const UserProfile: React.FC<UserProfileProps> = ({
    viewerType = 'guest'
}) => {
    const { id } = useParams<{ id: string }>();
    const { handleBackClick, handleNavigateToLibrary } = useProfileNavigation();

    const [playlists] = useState(getMockPlaylists);
    const [topSongs] = useState(getMockTopSongs);
    const [topArtists] = useState(getMockTopArtists);

    const sections = useMemo(() => [createPlaylistSection(playlists)], [playlists]);

    const handleTabChange = (tab: string) => {
        if (tab === 'library') {
            handleNavigateToLibrary();
        }
    };

    const profileCard = (
        <ProfileCard
            isVerified
            name="Vanessa"
            stats={{ followers: 124, following: 16, publicPlaylists: 11 }}
            src="https://placehold.co/378x264"
            alt="profileImage"
        />
    );

    const actionButtons = (
        <ProfileActionButtons viewerType={viewerType} profileType="user" />
    );

    const profileView = (
        <>
            <ContentSections sections={sections} />
            <ProfileCard
                variant="bio"
                isVerified
                title="Top 1% listener"
                bio="Curating playlists with 127 collections and counting 🎧 From morning coffee to late-night vibes, I have a soundtrack for every moment. Share your recommendations below 💌"
                src="https://placehold.co/378x264"
                alt="profileImage"
            />
            <TopSongsWidget
                songs={topSongs}
                dateRange="Nov 10 –16"
                onSongMenuClick={(songId) => console.log('Menu clicked for song:', songId)}
            />
            <TopArtistsWidget
                artists={topArtists}
                dateRange="Nov 10 –16"
            />
        </>
    );

    const handleMessageClick = () => {
        console.log('Message clicked');
    };

    const handleMenuClick = () => {
        console.log('Menu clicked');
    };

    return (
        <ProfileLayout
            viewerType={viewerType}
            profileType="user"
            secondaryTab="Library"
            onBackClick={handleBackClick}
            onTabChange={handleTabChange}
            onMessageClick={handleMessageClick}
            onMenuClick={handleMenuClick}
            profileCard={profileCard}
            actionButtons={actionButtons}
            profileView={profileView}
        />
    );
};