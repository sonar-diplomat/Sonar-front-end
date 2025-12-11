import React from 'react';
import { Modal, LoadingPlaceholder } from '@shared/ui';
import { useGetFollowersQuery, useGetFollowingQuery } from '@entities/User/api/rtkApi';
import { UserListItem } from './UserListItem';
import styles from './FollowersFollowingModal.module.css';

interface FollowersFollowingModalProps {
    isOpen: boolean;
    onClose: () => void;
    userId: number;
    type: 'followers' | 'following';
}

export const FollowersFollowingModal: React.FC<FollowersFollowingModalProps> = ({
    isOpen,
    onClose,
    userId,
    type,
}) => {
    const { 
        data: followersData, 
        isLoading: isLoadingFollowers,
        error: followersError 
    } = useGetFollowersQuery(userId, {
        skip: !isOpen || type !== 'followers',
    });

    const { 
        data: followingData, 
        isLoading: isLoadingFollowing,
        error: followingError 
    } = useGetFollowingQuery(userId, {
        skip: !isOpen || type !== 'following',
    });

    const isLoading = type === 'followers' ? isLoadingFollowers : isLoadingFollowing;
    const error = type === 'followers' ? followersError : followingError;
    const items = type === 'followers' 
        ? followersData?.items || []
        : followingData?.items || [];

    const title = type === 'followers' ? 'Followers' : 'Following';

    return (
        <Modal 
            isOpen={isOpen} 
            onClose={onClose}
            title={title}
            className={styles.modal}
        >
            <div className={styles.container}>
                {isLoading && (
                    <div className={styles.loadingContainer}>
                        <LoadingPlaceholder variant="skeleton" />
                    </div>
                )}

                {error && (
                    <div className={styles.errorContainer}>
                        <p className={styles.errorText}>
                            Failed to load {type === 'followers' ? 'followers' : 'following'}
                        </p>
                    </div>
                )}

                {!isLoading && !error && items.length === 0 && (
                    <div className={styles.emptyContainer}>
                        <p className={styles.emptyText}>
                            No {type === 'followers' ? 'followers' : 'following'} yet
                        </p>
                    </div>
                )}

                {!isLoading && !error && items.length > 0 && (
                    <div className={styles.list}>
                        {items.map((user) => (
                            <UserListItem key={user.id} user={user} />
                        ))}
                    </div>
                )}
            </div>
        </Modal>
    );
};

