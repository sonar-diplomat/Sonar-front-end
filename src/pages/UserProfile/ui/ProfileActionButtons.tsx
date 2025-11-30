import React from 'react';
import { Button, MoreIcon, UpRightArrow, EditProfileIcon, StatisticsIcon, ShuffleIcon, PlayIcon } from '@shared/ui';
import type { UserRole, ViewerType } from './UserProfile';
import styles from './UserProfile.module.css';

interface ProfileActionButtonsProps {
    role: UserRole;
    viewerType: ViewerType;
}

//button configurations
const FILLED_BUTTON_PROPS = {
    variant: 'filled' as const,
    size: 'medium' as const,
    shape: 'cr-16' as const,
    fullWidth: true,
};

const ICON_BUTTON_PROPS = {
    variant: 'text' as const,
    theme: 'dark' as const,
    size: 'medium' as const,
    iconOnly: true,
};

export const ProfileActionButtons: React.FC<ProfileActionButtonsProps> = ({ role, viewerType }) => {
    // Reusable buttons
    const followButton = (
        <Button {...FILLED_BUTTON_PROPS} theme="light" icon={<UpRightArrow />}>
            Follow
        </Button>
    );

    const moreButton = <Button {...ICON_BUTTON_PROPS} icon={<MoreIcon />} />;

    // Owner viewing their own profile
    if (viewerType === 'owner') {
        return (
            <div className={styles.profileActions}>
                <Button {...FILLED_BUTTON_PROPS} theme="dark" icon={<EditProfileIcon />}>
                    Edit profile
                </Button>
                <Button {...FILLED_BUTTON_PROPS} theme="dark" icon={<StatisticsIcon />}>
                    Statistics
                </Button>
            </div>
        );
    }

    // Guest viewing artist profile
    if (role === 'artist') {
        return (
            <div className={styles.profileActions}>
                {followButton}
                {moreButton}
                <Button {...ICON_BUTTON_PROPS} icon={<ShuffleIcon />} />
                <Button {...ICON_BUTTON_PROPS} icon={<PlayIcon />} />
            </div>
        );
    }

    // Guest viewing regular user profile
    return (
        <div className={styles.profileActions}>
            {followButton}
            {moreButton}
        </div>
    );
};