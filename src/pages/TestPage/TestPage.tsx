import React, { useState } from "react";
import {TabBar} from "@widgets/TabBar";
import {MicroPlayer} from "@widgets/MicroPlayer";
import type { TrackDTO } from "@entities/Music";

export const TestPage: React.FC = () => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(45);

    const sampleTrack: TrackDTO = {
        id: 1,
        title: "Sample Track Name",
        duration: "180",
        isExplicit: false,
        drivingDisturbingNoises: false,
        visibilityStateId: 1,
        coverId: 1,
        lowQualityAudioFileId: 1,
        mediumQualityAudioFileId: null,
        highQualityAudioFileId: null,
        cover: {
            id: 1,
            url: "https://via.placeholder.com/150"
        }
    };

    const handlePlayPause = () => {
        setIsPlaying(!isPlaying);
    };

    const handleNext = () => {
        console.log("Next track");
    };

    const handleSeek = (time: number) => {
        setCurrentTime(time);
    };

    return (
        <div style={{ padding: '16px', overflowY: 'scroll' }}>
            <MicroPlayer
                currentTrack={sampleTrack}
                isPlaying={isPlaying}
                currentTime={currentTime}
                duration={180}
                onPlayPause={handlePlayPause}
                onNext={handleNext}
                onSeek={handleSeek}
            />

            <TabBar />
        </div>
    );
}