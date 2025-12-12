import React from 'react';

import styles from "./ProfileHeader.module.css";

import { Button, LeftArrow, MessageIcon, SettingsIcon } from "@shared/ui";
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
    onSettingsClick,
}) => {

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