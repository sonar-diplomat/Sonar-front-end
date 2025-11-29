import React, { useState } from 'react';

import styles from "./ProfileHeader.module.css";

import { Button, LeftArrow, TabSlider } from "@shared/ui";

interface ProfileHeaderProps {
    secondaryTab?: string;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({ secondaryTab = 'Library' }) => {
    const [activeTab, setActiveTab] = useState('profile');

    const tabs = [
        { value: 'profile', label: 'Profile' },
        { value: secondaryTab, label: secondaryTab }
    ];

    return (
        <div className={styles.header}>
            <Button variant={"filled"} theme={"dark"} size={"medium"} shape={"cr-16"} icon={<LeftArrow/>} />
            <TabSlider tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
        </div>
    );
};