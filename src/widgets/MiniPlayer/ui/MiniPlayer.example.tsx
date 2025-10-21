import React, { useState } from "react"
import {MiniPlayer} from "@widgets/MiniPlayer";
import type {Track} from "@entities/Music";

const MiniPlayerExample = () => {
    const [currentTime, setCurrentTime] = useState(45);
    const [isLiked, setIsLiked] = useState(false);
    const mockTrack: Track = {
        id: "1",
        title: "Bathroom",
        duration: 175,
        artistId: "artist-1",
        albumId: "album-1",
        coverUrl: "https://i.scdn.co/image/ab67616d00001e02f46e995aa84c6eb1080100a4",
        audioUrl: "https://example.com/audio.mp3",
        artist: {
            id: "artist-1",
            name: "Montell Fish",
            userId: "user-1",
            bio: "Electronic artist",
            profilePictureUrl: undefined,
            verified: false,
            followerCount: 0,
            createdAt: new Date(),
        },
        album: undefined,
        artistName: "Moody",
        albumName: undefined,
        createdAt: new Date(),
        playCount: 0,
        likeCount: 0,
        visibility: "Public" as const,
        genreIds: [],
        tags: [],
        lyrics: undefined,
        language: undefined,
        isExplicit: false,
        isPremium: false,
        fileId: "file-1",
    };

    const handlePlayPause = () => {
        console.log("Play/Pause toggled");
    };

    const handleNext = () => {
        console.log("Next track");
    };

    const handlePrevious = () => {
        console.log("Previous track");
    };

    const handleSeek = (time: number) => {
        console.log("Seek to:", time);
        setCurrentTime(time);
    };

    const handleLike = () => {
        setIsLiked(!isLiked);
        console.log("Like toggled");
    };

    return (
        <MiniPlayer
            currentTrack={mockTrack}
            isPlaying={false}
            currentTime={currentTime}
            duration={mockTrack.duration}
            isLiked={isLiked}
            onPlayPause={handlePlayPause}
            onNext={handleNext}
            onPrevious={handlePrevious}
            onSeek={handleSeek}
            onLike={handleLike}
        />
    );
}
export default MiniPlayerExample