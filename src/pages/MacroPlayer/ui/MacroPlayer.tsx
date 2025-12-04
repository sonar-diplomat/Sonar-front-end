import React from 'react';
import styles from './MacroPlayer.module.css';
import {Button, HeartIcon, LeftArrow, MoreIcon, TrackItem} from "@shared/ui";
import {ProgressBar} from "@widgets/MiniPlayer/ui/ProgressBar.tsx";

interface Track {
    id: string;
    title: string;
    artist: string;
    coverImage?: string;
}

export const MacroPlayer: React.FC = () => {
    const currentTime = 120;
    const duration = 360;
    const onSeek = (newTime: number) => {

    }
    const currentTrack: Track = {
        id: '1',
        title: 'Song Title',
        artist: 'Artist Name',
        coverImage: undefined,
    };

    const upNextTracks: Track[] = [
        { id: '2', title: 'Next Song 1', artist: 'Artist 1' },
        { id: '3', title: 'Next Song 2', artist: 'Artist 2' },
        { id: '4', title: 'Next Song 3', artist: 'Artist 3' },
        { id: '5', title: 'Next Song 4', artist: 'Artist 4' },
        { id: '6', title: 'Next Song 5', artist: 'Artist 5' },
    ];

    const handleOnBackClick = ()=>{

    }
    return (
        <div className={styles.macroPlayer}>
            {/* Top Bar */}
            <div className={styles.topBar}>
                <Button variant={"filled"} theme={"dark"} size={"medium"} shape={"cr-16"} icon={<LeftArrow/>} onClick={handleOnBackClick} iconOnly />
                <Button variant={"filled"} theme={"dark"} size={"medium"} shape={"cr-16"} icon={<MoreIcon/>} onClick={handleOnBackClick} iconOnly />
            </div>

            {/* Main Player - MP3 Style */}
            <div className={styles.mainPlayer}>
                {/* Album Cover */}
                <div className={styles.albumCover}>
                    {currentTrack.coverImage ? (
                        <img src={currentTrack.coverImage} alt={currentTrack.title} />
                    ) : (
                        <div className={styles.placeholderCover} />
                    )}
                </div>

                {/* Track Info Row */}
                <div className={styles.infoRow}>
                    <div className={styles.trackInfo}>
                        <div className={styles.trackTitle}>{currentTrack.title}</div>
                        <div className={styles.artistName}>{currentTrack.artist}</div>
                    </div>
                    <Button variant={"filled"} theme={"dark"} size={"medium"} shape={"cr-16"} icon={<HeartIcon/>} onClick={handleOnBackClick} iconOnly />
                </div>

                <ProgressBar
                    currentTime={currentTime}
                    duration={duration}
                    onSeek={onSeek}
                />

                {/* MP3 Player Style Controls */}
                <div className={styles.mp3Controls}>
                    {/* Circular Control Wheel */}
                    <div className={styles.controlWheel}>
                        <div className={styles.wheelOuter}>
                            {/* Top button */}
                            <button className={styles.wheelTop} aria-label="Volume Up">
                                <span className={styles.wheelIcon} />
                            </button>

                            {/* Middle row: Left, Center, Right */}
                            <div className={styles.wheelMiddleRow}>
                                <button className={styles.wheelLeft} aria-label="Previous">
                                    <span className={styles.wheelIcon} />
                                </button>
                                <button className={styles.wheelCenter} aria-label="Play/Pause">
                                    <div className={styles.centerCircle} />
                                </button>
                                <button className={styles.wheelRight} aria-label="Next">
                                    <span className={styles.wheelIcon} />
                                </button>
                            </div>

                            {/* Bottom button */}
                            <button className={styles.wheelBottom} aria-label="Volume Down">
                                <span className={styles.wheelIcon} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            {/*TODO Lyrics Section */}

            {/* What Next Section */}
            <div className={styles.whatNextSection}>
                <div className={styles.sectionHeader}>
                    <h2>What's next?</h2>
                    <button className={styles.expandButton} aria-label="Expand">
                        <span>⤢</span>
                    </button>
                </div>
                <div className={styles.trackList}>
                    {upNextTracks.map((track) => (
                        <TrackItem artist={track.artist} title={track.title} key={track.id} imageSrc={track.coverImage} imageAlt={track.title} onMenuClick={handleOnBackClick}/>
                    ))}
                </div>
            </div>

            {/* Artist Info Section */}
            <div className={styles.artistInfoSection}>
                <div className={styles.artistGrid}>
                    <div className={styles.artistImageCard}>
                        <div className={styles.artistImage} />
                    </div>
                    <div className={styles.artistStatsCard}>
                        <div className={styles.statItem} />
                        <div className={styles.statGraph} />
                    </div>
                </div>
                <div className={styles.artistGrid}>
                    <div className={styles.exploreCard}>
                        <div className={styles.exploreIcon} />
                        <div className={styles.exploreText} />
                    </div>
                    <div className={styles.favoriteCard}>
                        <div className={styles.favoriteIcon} />
                        <div className={styles.favoriteText} />
                    </div>
                </div>
            </div>
        </div>
    );
};