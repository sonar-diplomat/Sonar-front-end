import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import styles from "./ProfileHeader.module.css";

import { Button, LeftArrow, TabSlider } from "@shared/ui";

export interface ProfileHeaderProps {
    title?: string;
    showBackButton?: boolean;
    showTabs?: boolean;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
    title,
    showBackButton = false,
    showTabs = false
}) => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('profile');

    const tabs = [
        {value: 'profile', label: 'Profile'},
        {value: 'library', label: 'Library'}
    ];

    const handleBackClick = () => {
        navigate(-1);
    };

    return (
        <div className={styles.header}>
            {showBackButton && (
                <Button
                    variant="filled"
                    theme="dark"
                    size="medium"
                    shape="cr-16"
                    icon={<LeftArrow/>}
                    onClick={handleBackClick}
                />
            )}

            {title && <h1 className={styles.title}>{title}</h1>}

            {showTabs && (
                <TabSlider
                    tabs={tabs}
                    activeTab={activeTab}
                    onChange={setActiveTab}
                />
            )}

            {!showBackButton && !title && !showTabs && (
                <>
                    <Button
                        variant="filled"
                        theme="dark"
                        size="medium"
                        shape="cr-16"
                        icon={<LeftArrow/>}
                    />
                    <TabSlider
                        tabs={tabs}
                        activeTab={activeTab}
                        onChange={setActiveTab}
                    />
                </>
            )}
        </div>
    );
};