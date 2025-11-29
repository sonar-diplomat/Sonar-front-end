import React from 'react';
import { Button, MoreIcon, UpRightArrow, EditIcon, StatisticsIcon, ShuffleIcon, PlayIcon } from '@shared/ui';
import type { UserRole, ViewerType } from './UserProfile';
import styles from './UserProfile.module.css';

interface ProfileActionButtonsProps {
    role: UserRole;
    viewerType: ViewerType;
}

export const ProfileActionButtons: React.FC<ProfileActionButtonsProps> = ({ role, viewerType }) => {
    // Owner viewing their own profile (user or artist)
    if (viewerType === 'owner') {
        return (
            <div className={styles.profileActions}>
                <Button
                    variant="filled"
                    theme="dark"
                    size="medium"
                    shape="cr-16"
                    icon={<EditIcon />}
                    fullWidth
                >
                    Edit profile
                </Button>
                <Button
                    variant="filled"
                    theme="dark"
                    size="medium"
                    shape="cr-16"
                    icon={<StatisticsIcon />}
                    fullWidth
                >
                    Statistics
                </Button>
            </div>
        );
    }

    // Guest viewing someone else's profile
    if (viewerType === 'guest') {
        // Guest viewing artist profile
        if (role === 'artist') {
            return (
                <div className={styles.profileActions}>
                    <Button
                        variant="filled"
                        theme="light"
                        size="medium"
                        shape="cr-16"
                        icon={<UpRightArrow />}
                        fullWidth
                    >
                        Follow
                    </Button>
                    <Button
                        variant="text"
                        theme="dark"
                        icon={<MoreIcon />}
                        size="medium"
                        iconOnly
                    />
                    <Button
                        variant="text"
                        theme="dark"
                        size="medium"
                        icon={<ShuffleIcon />}
                        iconOnly
                    />
                    <Button
                        variant="text"
                        theme="dark"
                        size="medium"
                        icon={<PlayIcon />}
                        iconOnly
                    />
                </div>
            );
        }

        // Guest viewing regular user profile
        return (
            <div className={styles.profileActions}>
                <Button
                    variant="filled"
                    theme="light"
                    size="medium"
                    shape="cr-16"
                    icon={<UpRightArrow />}
                    fullWidth
                >
                    Follow
                </Button>
                <Button
                    variant="text"
                    theme="dark"
                    icon={<MoreIcon />}
                    size="medium"
                    iconOnly
                />
            </div>
        );
    }

    return null;
};