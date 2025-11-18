import styles from './MiniPlayer.module.css';
import React, {useMemo} from "react";
import {getArtistNames} from "@widgets/MiniPlayer/lib/utils.ts";
import type {MiniPlayerProps} from "../model/types";
import {PlayerActions} from "./PlayerActions";

interface TrackInfoProps {
    currentTrack: MiniPlayerProps['currentTrack'];
    isLiked: boolean;
    onLike: () => void;
}

export const TrackInfo = ({currentTrack, isLiked, onLike}: TrackInfoProps) => {
    const artistNames = useMemo(() =>
            getArtistNames(currentTrack),
        [currentTrack]
    );
    return(
        <div className={styles.infoHeader}>
            <div className={styles.songMeta}>
                <h2 className={styles.title}>{currentTrack?.title || currentTrack?.name || 'Unknown Track'}</h2>
                <p className={styles.artist}>{artistNames}</p>
            </div>
            <PlayerActions isLiked={isLiked} onLike={onLike}/>
        </div>
    )
}

