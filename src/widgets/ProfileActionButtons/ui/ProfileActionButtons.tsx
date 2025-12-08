import React from 'react';
import { Button, MoreIcon, UpRightArrow, EditProfileIcon, StatisticsIcon, ShuffleIcon, PlayIcon } from '@shared/ui';
import type { ViewerType } from '@shared/types';
import styles from './ProfileActionButtons.module.css';

export type ProfileType = 'user' | 'artist';

interface ProfileActionButtonsProps {
    viewerType: ViewerType;
    profileType: ProfileType;
    isFollowing?: boolean;
    isFriend?: boolean;
    onFollow?: () => void;
    onUnfollow?: () => void;
    onCreateChat?: () => void;
    isLoading?: boolean;
}

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

export const ProfileActionButtons: React.FC<ProfileActionButtonsProps> = ({ 
    viewerType, 
    profileType,
    isFollowing = false,
    isFriend = false,
    onFollow,
    onUnfollow,
    onCreateChat,
    isLoading = false,
}) => {
    // Owner viewing their own profile (same for both user and artist)
    if (viewerType === 'owner') {
        return (
            <div className={styles.container}>
                <Button {...FILLED_BUTTON_PROPS} theme="dark" icon={<EditProfileIcon />}>
                    Edit profile
                </Button>
                <Button {...FILLED_BUTTON_PROPS} theme="dark" icon={<StatisticsIcon />}>
                    Statistics
                </Button>
            </div>
        );
    }

    // Guest viewing artist profile - includes playback controls
    if (profileType === 'artist') {
        return (
            <div className={styles.container}>
                <Button {...FILLED_BUTTON_PROPS} theme="light" icon={<UpRightArrow />}>
                    Follow
                </Button>
                <Button {...ICON_BUTTON_PROPS} icon={<MoreIcon />} />
                <Button {...ICON_BUTTON_PROPS} icon={<ShuffleIcon />} />
                <Button {...ICON_BUTTON_PROPS} icon={<PlayIcon />} />
            </div>
        );
    }

    // Guest viewing regular user profile
    const handleFollowClick = () => {
        if (isFollowing) {
            onUnfollow?.();
        } else {
            onFollow?.();
        }
    };

    return (
        <div className={styles.container}>
            {isFriend ? (
                <>
                    <Button 
                        {...FILLED_BUTTON_PROPS} 
                        theme="light" 
                        onClick={onCreateChat}
                        loading={isLoading}
                    >
                        Message
                    </Button>
                    <Button 
                        {...FILLED_BUTTON_PROPS} 
                        theme="dark" 
                        onClick={handleFollowClick}
                        loading={isLoading}
                    >
                        {isFollowing ? 'Following' : 'Follow'}
                    </Button>
                </>
            ) : (
                <>
                    <Button 
                        {...FILLED_BUTTON_PROPS}
                        theme="light" 
                        icon={isFollowing ? undefined : <UpRightArrow />}
                        onClick={handleFollowClick}
                        loading={isLoading}
                    >
                        {isFollowing ? 'Following' : 'Follow'}
                    </Button>
                </>
            )}
            <Button {...ICON_BUTTON_PROPS} icon={<MoreIcon />} />
        </div>
    );
};
