import React, { useMemo, useState } from 'react';
import { useParams, Outlet, useNavigate } from 'react-router-dom';
import { ProfileCard } from '@shared/ui';
import { ProfileLayout } from '@widgets/ProfileLayout';
import { ContentSections } from '@widgets/ContentSections';
import { ProfileActionButtons } from '@widgets/ProfileActionButtons';
import { useProfileNavigation } from '@shared/hooks';
import { getMockPlaylists } from '@shared/lib/mocks';
import { createPlaylistSection } from '@shared/lib/profile';
import type { ViewerType } from '@shared/types';

interface ArtistProfileProps {
    viewerType?: ViewerType;
}

export const ArtistProfile: React.FC<ArtistProfileProps> = ({
    viewerType = 'owner'
}) => {
    const { id } = useParams<{ id: string }>();
    const { handleBackClick } = useProfileNavigation();
    const navigate = useNavigate();

    const [playlists] = useState(getMockPlaylists);

    const sections = useMemo(() => [createPlaylistSection(playlists)], [playlists]);

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

    const postsView = <Outlet />;

    const handleTabChange = (tab: string) => {
        if (tab === 'posts') {
            navigate(`/artist/${id}/posts`);
        } else {
            navigate(`/artist/${id}`);
        }
    };

    const handleMessageClick = () => {
        console.log('Message clicked');
    };

    return (
        <ProfileLayout
            viewerType={viewerType}
            profileType="artist"
            secondaryTab="Posts"
            onBackClick={handleBackClick}
            onMessageClick={handleMessageClick}
            onTabChange={handleTabChange}
            profileCard={profileCard}
            actionButtons={actionButtons}
            profileView={profileView}
            secondaryView={postsView}
        />
    );
};