import React, { useState, useEffect } from 'react';

import styles from "./ProfileHeader.module.css";

import { Button, LeftArrow, TabSlider } from "@shared/ui";

interface ProfileHeaderProps {
    secondaryTab?: string;
    onBackClick?: () => void;
    onTabChange?: (tab: string) => void;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
    secondaryTab = 'Library',
    onBackClick,
    onTabChange
}) => {
    const [activeTab, setActiveTab] = useState('profile');

    const tabs = [
        { value: 'profile', label: 'Profile' },
        { value: secondaryTab.toLowerCase(), label: secondaryTab }
    ];

    const handleTabChange = (value: string) => {
        setActiveTab(value);
        if (onTabChange) {
            onTabChange(value);
        }
    };

    useEffect(() => {
        // Reset to profile tab when component mounts
        setActiveTab('profile');
    }, []);

    return (
        <div className={styles.header}>
            <Button
                variant={"filled"}
                theme={"dark"}
                size={"medium"}
                shape={"cr-16"}
                icon={<LeftArrow/>}
                onClick={onBackClick}
            />
            <TabSlider tabs={tabs} activeTab={activeTab} onChange={handleTabChange} />
        </div>
    );
};