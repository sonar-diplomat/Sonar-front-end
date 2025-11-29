import React, { useState } from 'react';

import styles from "./ProfileHeader.module.css";

import { Button, LeftArrow, TabSlider } from "@shared/ui";

export const ProfileHeader = () => {
    const [activeTab, setActiveTab] = useState('profile');

    const tabs = [
        { value: 'profile', label: 'Profile' },
        { value: 'library', label: 'Library' }
    ];

    return (
        <div className={styles.header}>
            <Button variant={"filled"} theme={"dark"} size={"medium"} shape={"cr-16"} icon={<LeftArrow/>} />
            <TabSlider tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
        </div>
    );
};