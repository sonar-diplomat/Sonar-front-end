import React from 'react';
import { LoadingPlaceholder } from '@shared/ui';
import styles from './UserProfileSkeleton.module.css';

export const UserProfileSkeleton: React.FC = () => {
    return (
        <div className={styles.container}>
            {/* Profile Card Skeleton */}
            <div className={styles.profileCard}>
                <LoadingPlaceholder 
                    variant="skeleton" 
                    className={styles.avatarSkeleton}
                    style={{ width: '378px', height: '264px', borderRadius: '8px' }}
                />
                <div className={styles.statsSkeleton}>
                    <LoadingPlaceholder variant="skeleton" className={styles.statItem} />
                    <LoadingPlaceholder variant="skeleton" className={styles.statItem} />
                    <LoadingPlaceholder variant="skeleton" className={styles.statItem} />
                </div>
            </div>

            {/* Action Buttons Skeleton */}
            <div className={styles.actionButtonsSkeleton}>
                <LoadingPlaceholder variant="skeleton" className={styles.buttonSkeleton} />
                <LoadingPlaceholder variant="skeleton" className={styles.buttonSkeleton} />
            </div>

            {/* Content Skeleton */}
            <div className={styles.contentSkeleton}>
                <LoadingPlaceholder variant="skeleton" className={styles.sectionSkeleton} />
                <LoadingPlaceholder variant="skeleton" className={styles.bioSkeleton} />
                <LoadingPlaceholder variant="skeleton" className={styles.widgetSkeleton} />
                <LoadingPlaceholder variant="skeleton" className={styles.widgetSkeleton} />
            </div>
        </div>
    );
};

