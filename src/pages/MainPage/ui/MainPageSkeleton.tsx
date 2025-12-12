import React from 'react';
import { LoadingPlaceholder, ItemCardContainer } from '@shared/ui';
import styles from './MainPageSkeleton.module.css';

export const MainPageSkeleton: React.FC = () => {
    return (
        <div className={styles.container}>
            {/* Welcome Section Skeleton */}
            <div className={styles.welcomeSection}>
                <LoadingPlaceholder 
                    variant="skeleton" 
                    size="small" 
                    style={{ width: '120px', height: '14px' }} 
                />
                <LoadingPlaceholder 
                    variant="skeleton" 
                    size="medium" 
                    style={{ width: '200px', height: '32px', marginTop: '8px' }} 
                />
            </div>

            {/* Quick Start Section Skeleton */}
            <div className={styles.section}>
                <ItemCardContainer title="Quick start" count={8} countLabel="playlists">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                        <div key={i} className={styles.cardSkeleton}>
                            <LoadingPlaceholder 
                                variant="skeleton" 
                                size="small" 
                                style={{ width: '123px', height: '123px', borderRadius: '32px' }} 
                            />
                        </div>
                    ))}
                </ItemCardContainer>
            </div>

            {/* Listen Now Section Skeleton */}
            <div className={styles.section}>
                <LoadingPlaceholder 
                    variant="skeleton" 
                    size="medium" 
                    style={{ width: '150px', height: '20px', marginBottom: '16px' }} 
                />
                <div className={styles.listenNowGrid}>
                    {[1, 2, 3, 4].map((i) => (
                        <LoadingPlaceholder 
                            key={i}
                            variant="skeleton" 
                            size="large" 
                            style={{ width: '100%', aspectRatio: '1', borderRadius: '32px' }} 
                        />
                    ))}
                </div>
            </div>

            {/* Premium Card Skeleton */}
            <div className={styles.section}>
                <LoadingPlaceholder 
                    variant="skeleton" 
                    size="large" 
                    style={{ width: '100%', height: '120px', borderRadius: '16px' }} 
                />
            </div>

            {/* Recently Played Tracks Skeleton */}
            <div className={styles.section}>
                <div className={styles.recentlyPlayedHeader}>
                    <div className={styles.recentlyPlayedHeaderLeft}>
                        <LoadingPlaceholder 
                            variant="skeleton" 
                            size="medium" 
                            style={{ width: '150px', height: '20px' }} 
                        />
                        <LoadingPlaceholder 
                            variant="skeleton" 
                            size="small" 
                            style={{ width: '80px', height: '12px', marginTop: '4px' }} 
                        />
                    </div>
                </div>
                <div className={styles.cardsScroll}>
                    <div className={styles.cardsRow}>
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={i} className={styles.cardSkeleton}>
                                <LoadingPlaceholder 
                                    variant="skeleton" 
                                    size="medium" 
                                    style={{ width: '150px', height: '150px', borderRadius: '32px' }} 
                                />
                                <LoadingPlaceholder 
                                    variant="skeleton" 
                                    size="small" 
                                    style={{ width: '90%', height: '14px', marginTop: '8px' }} 
                                />
                                <LoadingPlaceholder 
                                    variant="skeleton" 
                                    size="small" 
                                    style={{ width: '70%', height: '12px', marginTop: '4px' }} 
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Recently Played Collections Skeleton */}
            <div className={styles.section}>
                <div className={styles.recentlyPlayedHeader}>
                    <div className={styles.recentlyPlayedHeaderLeft}>
                        <LoadingPlaceholder 
                            variant="skeleton" 
                            size="medium" 
                            style={{ width: '150px', height: '20px' }} 
                        />
                        <LoadingPlaceholder 
                            variant="skeleton" 
                            size="small" 
                            style={{ width: '100px', height: '12px', marginTop: '4px' }} 
                        />
                    </div>
                </div>
                <div className={styles.cardsScroll}>
                    <div className={styles.cardsRow}>
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={i} className={styles.cardSkeleton}>
                                <LoadingPlaceholder 
                                    variant="skeleton" 
                                    size="medium" 
                                    style={{ width: '150px', height: '150px', borderRadius: '32px' }} 
                                />
                                <LoadingPlaceholder 
                                    variant="skeleton" 
                                    size="small" 
                                    style={{ width: '90%', height: '14px', marginTop: '8px' }} 
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
