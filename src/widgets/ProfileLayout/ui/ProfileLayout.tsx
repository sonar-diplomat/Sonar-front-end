import React, { useState } from 'react';
import { ProfileHeader } from '@widgets/ProfileHeader';
import styles from './ProfileLayout.module.css';

export interface ProfileLayoutProps {
    secondaryTab: string;
    onBackClick?: () => void;
    profileCard: React.ReactNode;
    actionButtons: React.ReactNode;
    profileView: React.ReactNode;
    secondaryView?: React.ReactNode;
    onTabChange?: (tab: string) => void;
}

export const ProfileLayout: React.FC<ProfileLayoutProps> = ({
    secondaryTab,
    onBackClick,
    profileCard,
    actionButtons,
    profileView,
    secondaryView,
    onTabChange
}) => {
    const [activeView, setActiveView] = useState<'profile' | 'secondary'>('profile');

    const handleTabChange = (tab: string) => {
        if (tab === secondaryTab.toLowerCase()) {
            setActiveView('secondary');
        } else {
            setActiveView('profile');
        }
        onTabChange?.(tab);
    };

    return (
        <div className={styles.container}>
            <ProfileHeader
                secondaryTab={secondaryTab}
                onTabChange={handleTabChange}
                onBackClick={onBackClick}
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