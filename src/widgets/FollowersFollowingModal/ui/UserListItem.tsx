import React from 'react';
import { useNavigate } from 'react-router-dom';
import { getImageUrl } from '@shared/lib/image-utils';
import type { UserFollowerDTO, UserFollowingDTO } from '@entities/User/model/types';
import styles from './UserListItem.module.css';

interface UserListItemProps {
    user: UserFollowerDTO | UserFollowingDTO;
}

export const UserListItem: React.FC<UserListItemProps> = ({ user }) => {
    const navigate = useNavigate();
    const avatarUrl = getImageUrl(user.avatarImageId) || 'https://placehold.co/48x48';

    const handleClick = () => {
        navigate(`/user/${user.publicIdentifier}`);
    };

    return (
        <button className={styles.userItem} onClick={handleClick}>
            <div className={styles.avatarContainer}>
                <img 
                    src={avatarUrl} 
                    alt={user.userName}
                    className={styles.avatar}
                />
            </div>
            <div className={styles.userInfo}>
                <span className={styles.userName}>{user.userName}</span>
                <span className={styles.userIdentifier}>@{user.publicIdentifier}</span>
            </div>
        </button>
    );
};

