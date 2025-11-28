import React from 'react';
import styles from './TopSongsWidget.module.css';
import type { TopSongsWidgetProps } from '../TopSongsWidget.types';
import { SectionHeader, SongItem } from '@shared/ui';

export const TopSongsWidget: React.FC<TopSongsWidgetProps> = ({
    songs,
    dateRange,
    onSongMenuClick,
    className = ''
}) => {
    const wrapperClasses = [
        styles.topSongsWidget,
        className,
    ].filter(Boolean).join(' ');

    return (
        <div className={wrapperClasses}>
            <SectionHeader
                title="My top songs"
                subtitle={dateRange}
            />

            <div className={styles.listContainer}>
                {songs.map((song, index) => (
                    <React.Fragment key={song.id}>
                        <SongItem
                            rank={index + 1}
                            title={song.title}
                            artist={song.artist}
                            imageSrc={song.imageSrc}
                            imageAlt={song.imageAlt}
                            onMenuClick={onSongMenuClick ? () => onSongMenuClick(song.id) : undefined}
                        />
                        {index < songs.length - 1 && (
                            <div className={styles.divider} />
                        )}
                    </React.Fragment>
                ))}
            </div>
        </div>
    );
};