import React from 'react';
import { useGetUserByIdQuery, useGetUserProfileByIdentifierQuery } from '@entities/User/api/rtkApi';
import styles from './UserInfo.module.css';

interface MemberItemProps {
    userId: number;
    currentUserId: number | null;
    onClick: () => void;
}

export const MemberItem: React.FC<MemberItemProps> = ({ userId, currentUserId, onClick }) => {
    const { data: userData } = useGetUserByIdQuery(userId, {
        skip: !userId,
    });

    const { data: profileData } = useGetUserProfileByIdentifierQuery(
        userData?.publicIdentifier || '',
        {
            skip: !userData?.publicIdentifier,
        }
    );

    const displayName = userId === currentUserId 
        ? 'You' 
        : (profileData?.userName || `User ${userId}`);

    const initial = displayName.charAt(0).toUpperCase();

    return (
        <div className={styles.memberItem} onClick={onClick}>
            <div className={styles.memberAvatar}>
                <div className={styles.memberAvatarPlaceholder}>
                    {initial}
                </div>
            </div>
            <span className={styles.memberName}>
                {displayName}
            </span>
        </div>
    );
};

