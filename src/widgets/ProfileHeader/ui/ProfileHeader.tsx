import React from 'react';

import styles from "./ProfileHeader.module.css";

import { Button, LeftArrow, MessageIcon, EditProfileIcon, StatisticsIcon } from "@shared/ui";
import type { ViewerType } from '@shared/types';

export type ProfileType = 'user' | 'artist';

interface ProfileHeaderProps {
    viewerType: ViewerType;
    profileType: ProfileType;
    secondaryTab?: string;
    onBackClick?: () => void;
    onTabChange?: (tab: string) => void;
    onMessageClick?: () => void;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
    viewerType,
    onBackClick,
    onMessageClick,
}) => {

    return (
        <div className={styles.header}>
            <div className={styles.buttonsContainer}>
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

                {viewerType === 'owner' && (
                    <>
                        <Button
                            variant={"filled"}
                            theme={"dark"}
                            size={"medium"}
                            shape={"cr-16"}
                            icon={<EditProfileIcon />}
                            iconOnly
                        />
                        <Button
                            variant={"filled"}
                            theme={"dark"}
                            size={"medium"}
                            shape={"cr-16"}
                            icon={<StatisticsIcon />}
                            iconOnly
                        />
                    </>
                )}
            </div>
        </div>
    );
};