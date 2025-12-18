import React from 'react';
import styles from './TopArtistsWidget.module.css';
import type { TopArtistsWidgetProps } from '../TopArtistsWidget.types';
import { ArtistItem, WidgetErrorState, LoadingPlaceholder } from '@shared/ui';

export const TopArtistsWidget: React.FC<TopArtistsWidgetProps> = ({
    artists,
    dateRange,
    isLoading = false,
    error,
    onRetry,
    className = ''
}) => {
    const wrapperClasses = [
        styles.topArtistsWidget,
        className,
    ].filter(Boolean).join(' ');

    const renderContent = () => {
        if (isLoading) {
            return (
                <div className={styles.loadingContainer}>
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className={styles.skeletonItem}>
                            <LoadingPlaceholder 
                                variant="skeleton" 
                                style={{ width: '40px', height: '40px', borderRadius: '50%' }} 
                            />
                            <div style={{ flex: 1, marginLeft: '12px' }}>
                                <LoadingPlaceholder 
                                    variant="skeleton" 
                                    style={{ width: '50%', height: '14px', borderRadius: '4px' }} 
                                />
                            </div>
                        </div>
                    ))}
                </div>
            );
        }

        if (error) {
            return (
                <WidgetErrorState 
                    title="Could not load top artists"
                    message="Please try again later"
                    onRetry={onRetry}
                />
            );
        }

        if (!artists || artists.length === 0) {
            return (
                <WidgetErrorState 
                    title="No top artists yet"
                    message="Listen to more artists to see your top artists!"
                    icon={<span style={{ fontSize: '32px' }}>🎤</span>}
                />
            );
        }

        return (
            <div className={styles.listContainer}>
                {artists.map((artist, index) => (
                    <React.Fragment key={artist.id}>
                        <ArtistItem
                            rank={index + 1}
                            name={artist.name}
                            imageSrc={artist.imageSrc}
                            imageAlt={artist.imageAlt}
                        />
                        {index < artists.length - 1 && (
                            <div className={styles.divider} />
                        )}
                    </React.Fragment>
                ))}
            </div>
        );
    };

    return (
        <div className={wrapperClasses}>
            <h3 className={styles.label}>My top artists</h3>
            {renderContent()}
        </div>
    );
};
