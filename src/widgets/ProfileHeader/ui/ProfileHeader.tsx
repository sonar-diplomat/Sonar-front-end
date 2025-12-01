import React, { useState, useEffect } from 'react';

import styles from "./ProfileHeader.module.css";

import { Button, LeftArrow, TabSlider, MessageIcon, MenuIcon } from "@shared/ui";
import type { ViewerType } from '@shared/types';

export type ProfileType = 'user' | 'artist';

interface ProfileHeaderProps {
    viewerType: ViewerType;
    profileType: ProfileType;
    secondaryTab?: string;
    onBackClick?: () => void;
    onTabChange?: (tab: string) => void;
    onMessageClick?: () => void;
    onMenuClick?: () => void;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
    viewerType,
    profileType,
    secondaryTab,
    onBackClick,
    onTabChange,
    onMessageClick,
    onMenuClick
}) => {
    const [activeTab, setActiveTab] = useState('profile');

    // Determine primary and secondary tab based on profile type
    const getPrimaryTab = () => {
        if (profileType === 'artist') {
            return { value: 'music', label: 'Music' };
        }
        return { value: 'profile', label: 'Profile' };
    };

    const getSecondaryTab = () => {
        if (secondaryTab) {
            return { value: secondaryTab.toLowerCase(), label: secondaryTab };
        }
        if (profileType === 'artist') {
            return { value: 'messages', label: 'Messages' };
        }
        return { value: 'library', label: 'Library' };
    };

    const tabs = [getPrimaryTab(), getSecondaryTab()];

    const handleTabChange = (value: string) => {
        setActiveTab(value);
        if (onTabChange) {
            onTabChange(value);
        }
    };

    useEffect(() => {
        // Reset to primary tab when component mounts
        setActiveTab(tabs[0].value);
    }, []);

    return (
        <div className={styles.header}>
            {viewerType === 'guest' ? (
                <Button
                    variant={"filled"}
                    theme={"dark"}
                    size={"medium"}
                    shape={"cr-16"}
                    icon={<LeftArrow/>}
                    onClick={onBackClick}
                    iconOnly
                />
            ) : (
                <Button
                    variant={"filled"}
                    theme={"dark"}
                    size={"medium"}
                    shape={"cr-16"}
                    icon={<MessageIcon/>}
                    onClick={onMessageClick}
                    iconOnly
                />
            )}

            <div className={styles.tabSliderWrapper}>
                <TabSlider tabs={tabs} activeTab={activeTab} onChange={handleTabChange} />
            </div>

            {viewerType === 'owner' && (
                <Button
                    variant={"filled"}
                    theme={"dark"}
                    size={"medium"}
                    shape={"cr-16"}
                    icon={<MenuIcon/>}
                    onClick={onMenuClick}
                    iconOnly
                />
            )}
        </div>
    );
};