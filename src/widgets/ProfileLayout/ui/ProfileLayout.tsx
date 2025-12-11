import React, { useState } from 'react';
import { ProfileHeader } from '@widgets/ProfileHeader';
import type { ProfileType } from '@widgets/ProfileHeader';
import type { ViewerType } from '@shared/types';
import styles from './ProfileLayout.module.css';

export interface ProfileLayoutProps {
    viewerType: ViewerType;
    profileType: ProfileType;
    secondaryTab?: string;
    onBackClick?: () => void;
    onSettingsClick?: () => void;
    profileCard: React.ReactNode;
    actionButtons: React.ReactNode;
    profileView: React.ReactNode;
    secondaryView?: React.ReactNode;
    onTabChange?: (tab: string) => void;
    onMessageClick?: () => void;
}

export const ProfileLayout: React.FC<ProfileLayoutProps> = ({
    viewerType,
    profileType,
    secondaryTab,
    onBackClick,
    onSettingsClick,
    profileCard,
    actionButtons,
    profileView,
    secondaryView,
    onTabChange,
    onMessageClick,
}) => {
    const [activeView, setActiveView] = useState<'profile' | 'secondary'>('profile');

    const handleTabChange = (tab: string) => {
        const secondaryTabValue = secondaryTab?.toLowerCase() ||
            (profileType === 'artist' ? 'posts' : 'library');

        if (tab === secondaryTabValue) {
            setActiveView('secondary');
        } else {
            setActiveView('profile');
        }
        onTabChange?.(tab);
    };

    return (
        <div className={styles.container}>
            <ProfileHeader
                viewerType={viewerType}
                profileType={profileType}
                secondaryTab={secondaryTab}
                onTabChange={handleTabChange}
                onBackClick={onBackClick}
                onMessageClick={onMessageClick}
                onSettingsClick={onSettingsClick}
            />

            {activeView === 'profile' ? (
                <>
                    {profileCard}
                    {actionButtons}
                    <div className={styles.mainContent}>
                        {profileView}
                    </div>
                </>
            ) : (
                secondaryView
            )}
        </div>
    );
};