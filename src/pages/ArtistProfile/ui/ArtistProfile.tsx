import React, { useMemo, useState } from 'react';
import { useParams, Outlet, useNavigate } from 'react-router-dom';
import { ProfileCard } from '@shared/ui';
import { ProfileLayout } from '@widgets/ProfileLayout';
import { ContentSections } from '@widgets/ContentSections';
import { ProfileActionButtons } from '@widgets/ProfileActionButtons';
import { useProfileNavigation } from '@shared/hooks';
import { getMockPlaylists } from '@shared/lib/mocks';
import { createPlaylistSection } from '@shared/lib/profile';
import { getImageUrl } from '@shared/lib/image-utils';
import { MarkdownRenderer } from '@shared/lib/markdown/MarkdownRenderer';
import type { ViewerType } from '@shared/types';
import { useCurrentUserId } from '@shared/lib/auth';
import { useGetArtistByIdQuery } from '@entities/Artist';
import styles from './ArtistProfile.module.css';

interface ArtistProfileProps {
    viewerType?: ViewerType;
}

export const ArtistProfile: React.FC<ArtistProfileProps> = ({
    viewerType: initialViewerType
}) => {
    const { id } = useParams<{ id: string }>();
    const { handleBackClick } = useProfileNavigation();
    const navigate = useNavigate();
    const currentUserId = useCurrentUserId();

    const [playlists] = useState(getMockPlaylists);

    // Fetch artist data by ID
    const {
        data: artistData,
        isLoading: isLoadingArtist,
        error: artistError
    } = useGetArtistByIdQuery(Number(id), {
        skip: !id,
    });

    const viewerType: ViewerType = useMemo(() => {
        if (initialViewerType) return initialViewerType;
        if (currentUserId && artistData && currentUserId === artistData.userId) {
            return 'owner';
        }
        return 'guest';
    }, [initialViewerType, currentUserId, artistData]);

    const sections = useMemo(() => [createPlaylistSection(playlists)], [playlists]);

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

    if (isLoadingArtist || !artistData) {
        return <div>Loading artist profile...</div>;
    }

    if (artistError) {
        console.error('Artist profile error:', artistError);
        return <div>Error loading artist profile</div>;
    }

    // Calculate avatar URL from API data
    const avatarUrl = getImageUrl(artistData.user?.avatarImageId) || 'https://placehold.co/378x264';

    // Check if the artist is verified based on access features
    const isVerified = artistData.user?.accessFeatures?.some(
        (feature) => feature.name?.toLowerCase().includes('verified')
    ) ?? false;

    const profileCard = (
        <ProfileCard
            isVerified={isVerified}
            name={artistData.artistName}
            monthlyListeners={18200000}
            src={avatarUrl}
            alt={`${artistData.artistName} profile image`}
        />
    );

    const actionButtons = viewerType === 'owner' ? null : (
        <ProfileActionButtons
            viewerType={viewerType}
            profileType="artist"
        />
    );

    const bioSection = artistData.user?.biography ? (
        <div className={styles.bioSection}>
            <h3 className={styles.bioLabel}>About the Artist</h3>
            <MarkdownRenderer content={artistData.user.biography} className={styles.bioText} />
        </div>
    ) : null;

    const profileView = (
        <>
            <ContentSections sections={sections} />
            {bioSection && (
                <div className={styles.widgetsContainer}>
                    <div className={styles.topRow}>
                        {bioSection}
                    </div>
                </div>
            )}
        </>
    );

    const postsView = <Outlet />;

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
