import React from 'react';

import { TrackItem } from '@shared/ui/TrackItem';

import styles from './CollectionView.module.css';
import type { CollectionViewProps } from './CollectionView.types';

export const CollectionView: React.FC<CollectionViewProps> = ({
    title = 'Tracks inside',
    tracks,
    onTrackClick,
    onTrackMenuClick,
    className = ''
}) => {
    const wrapperClasses = [
        styles.collectionView,
        className,
    ].filter(Boolean).join(' ');

    return (
        <div className={wrapperClasses}>
            <div className={styles.header}>
                <h2 className={styles.title}>{title}</h2>
            </div>
            <div className={styles.container}>
                {tracks.length === 0 && <p>No tracks yet. Add songs using their menu.</p>}
                <div className={styles.trackList}>
                    {tracks.map((track, index) => (
                        <React.Fragment key={track.id}>
                            <TrackItem
                                title={track.title}
                                artist={track.artist}
                                imageSrc={track.imageSrc}
                                imageAlt={track.imageAlt}
                                onClick={onTrackClick ? () => onTrackClick(track.id) : undefined}
                                onMenuClick={onTrackMenuClick ? () => onTrackMenuClick(track.id) : undefined}
                            />
                            {index < tracks.length - 1 && (
                                <div className={styles.divider} />
                            )}
                        </React.Fragment>
                    ))}
                </div>
            </div>
        </div>
    );
};
