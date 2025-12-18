import React from 'react';
import styles from './TopSongsWidget.module.css';
import type { TopSongsWidgetProps, Song } from '../TopSongsWidget.types';
import { SongItem, WidgetErrorState, LoadingPlaceholder } from '@shared/ui';
import { useGetTrackQuery } from '@entities/Music/api/rtkApi';
import { usePlayer } from '@shared/store/features/player';

// Component to handle track playback on click
const PlayableSongItem: React.FC<{
    song: Song;
    rank: number;
}> = ({ song, rank }) => {
    const { playTrack } = usePlayer();
    const { data: track } = useGetTrackQuery(song.trackId, { skip: false });

    const handleClick = () => {
        if (track) {
            playTrack(track);
        }
    };

    return (
        <SongItem
            rank={rank}
            title={song.title}
            artist={song.artist}
            imageSrc={song.imageSrc}
            imageAlt={song.imageAlt}
            onClick={handleClick}
        />
    );
};

export const TopSongsWidget: React.FC<TopSongsWidgetProps> = ({
    songs,
    isLoading = false,
    error,
    onRetry,
    className = ''
}) => {
    const wrapperClasses = [
        styles.topSongsWidget,
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
                                style={{ width: '40px', height: '40px', borderRadius: '4px' }} 
                            />
                            <div style={{ flex: 1, marginLeft: '12px' }}>
                                <LoadingPlaceholder 
                                    variant="skeleton" 
                                    style={{ width: '60%', height: '14px', marginBottom: '4px', borderRadius: '4px' }} 
                                />
                                <LoadingPlaceholder 
                                    variant="skeleton" 
                                    style={{ width: '40%', height: '12px', borderRadius: '4px' }} 
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
                    title="Could not load top songs"
                    message="Please try again later"
                    onRetry={onRetry}
                />
            );
        }

        if (!songs || songs.length === 0) {
            return (
                <WidgetErrorState 
                    title="No top songs yet"
                    message="Listen to more music to see your top songs!"
                    icon={<span style={{ fontSize: '32px' }}>🎵</span>}
                />
            );
        }

        return (
            <div className={styles.listContainer}>
                {songs.map((song, index) => (
                    <React.Fragment key={song.id}>
                        <PlayableSongItem
                            song={song}
                            rank={index + 1}
                        />
                        {index < songs.length - 1 && (
                            <div className={styles.divider} />
                        )}
                    </React.Fragment>
                ))}
            </div>
        );
    };

    return (
        <div className={wrapperClasses}>
            <h3 className={styles.label}>My top songs</h3>
            {renderContent()}
        </div>
    );
};
