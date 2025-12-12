import React, {useEffect, useState} from 'react';

import styles from "./ProfileHeader.module.css";

import {Button, LeftArrow, MessageIcon, EditProfileIcon, StatisticsIcon, TabSlider} from "@shared/ui";
import type { ViewerType } from '@shared/types';

export type ProfileType = 'user' | 'artist';

interface ProfileHeaderProps {
    viewerType: ViewerType;
    profileType: ProfileType;
    secondaryTab?: string;
    onBackClick?: () => void;
    onTabChange?: (tab: string) => void;
    onMessageClick?: () => void;
    onSettingsClick?: () => void;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
    viewerType,
    onBackClick,
    onMessageClick,
    onTabChange,
    profileType,
    secondaryTab
}) => {
    const [activeTab, setActiveTab] = useState('profile');
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
        setActiveTab(tabs[0].value);
    }, []);
    return (
        <div className={`${styles.header} ${viewerType === 'guest' ? styles.headerLeft : styles.headerRight}`}>
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
                <div className={styles.buttonsContainer}>
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
                {profileType=="artist" &&
                    (
                        <div className={styles.tabSliderWrapper}>
                            <TabSlider tabs={tabs} activeTab={activeTab} onChange={handleTabChange} />
                        </div>
                    )}

                    {viewerType === 'owner' && (
                        <Button
                            variant={"filled"}
                            theme={"dark"}
                            size={"medium"}
                            shape={"cr-16"}
                            icon={<SettingsIcon />}
                            onClick={onSettingsClick}
                            iconOnly
                        />
                    )}
                </div>
            )}
        </div>
    );
};