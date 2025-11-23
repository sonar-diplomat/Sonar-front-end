import React from 'react';
import styles from './TopArtistsWidget.module.css';
import type { TopArtistsWidgetProps } from '../TopArtistsWidget.types';
import { SectionHeader, ArtistItem } from '@shared/ui';

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
            <SectionHeader
                title="My top artist"
                subtitle={dateRange}
            />

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