import React from 'react';
import styles from './TopArtistsWidget.module.css';
import type { TopArtistsWidgetProps } from '../TopArtistsWidget.types';
import { ArtistItem } from '@shared/ui';

export const TopArtistsWidget: React.FC<TopArtistsWidgetProps> = ({
    artists,
    dateRange,
    className = ''
}) => {
    const wrapperClasses = [
        styles.topArtistsWidget,
        className,
    ].filter(Boolean).join(' ');

    return (
        <div className={wrapperClasses}>
            <h3 className={styles.label}>My top artist</h3>

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
        </div>
    );
};