import React, { useState, useEffect, useRef } from "react"
import {MiniPlayer} from "@widgets/MiniPlayer";
import type {Track, TrackDTO} from "@entities/Music";
import { useAuth } from "@shared/lib/auth";
import { useTrack } from "@entities/Music/model/store";
import { Api as MusicApi } from "@entities/Music/api/api";

export const MiniPlayerExample = () => {
    const [currentTime, setCurrentTime] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isLiked, setIsLiked] = useState(false);
    const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const [duration, setDuration] = useState(0);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const { login } = useAuth();
    const { refetch: fetchTrack } = useTrack();

    // Initialize audio element
    useEffect(() => {
        if (!audioUrl) return;

        const audio = new Audio(audioUrl);
        audioRef.current = audio;

        const updateTime = () => {
            if (audio) {
                setCurrentTime(audio.currentTime);
            }
        };

        const updateDuration = () => {
            if (audio) {
                setDuration(audio.duration || 0);
            }
        };

        const handleEnded = () => {
            setIsPlaying(false);
            setCurrentTime(0);
        };

        audio.addEventListener('timeupdate', updateTime);
        audio.addEventListener('loadedmetadata', updateDuration);
        audio.addEventListener('ended', handleEnded);

        return () => {
            audio.removeEventListener('timeupdate', updateTime);
            audio.removeEventListener('loadedmetadata', updateDuration);
            audio.removeEventListener('ended', handleEnded);
            audio.pause();
            audio.src = '';
        };
    }, [audioUrl]);

    // Handle play/pause
    useEffect(() => {
        if (!audioRef.current) return;

        if (isPlaying) {
            audioRef.current.play().catch(err => {
                console.error("Error playing audio:", err);
                setIsPlaying(false);
            });
        } else {
            audioRef.current.pause();
        }
    }, [isPlaying]);

    const handlePlayPause = () => {
        setIsPlaying(prev => !prev);
    };

    const handleNext = () => {
        console.log("Next track");
    };

    const handlePrevious = () => {
        console.log("Previous track");
    };

    const handleSeek = (time: number) => {
        if (audioRef.current) {
            audioRef.current.currentTime = time;
            setCurrentTime(time);
        }
    };

    const handleLike = () => {
        setIsLiked(!isLiked);
        console.log("Like toggled");
    };

    // Login on mount and stream track
    useEffect(() => {
        const controller = new AbortController();
        const performLogin = async () => {
            const deviceName = (navigator.userAgent || "Unknown Device").substring(0, 30);
            // Сохраняем credentials для автоматического логина при последующих запросах
            const loginSuccess = await login("john.doe@example.com", "securePassword123!", deviceName, true);
            
            if (loginSuccess) {
                console.log("Login successful");
                
                // Теперь хуки автоматически проверяют авторизацию
                // Если токена нет, они автоматически логинят используя сохраненные credentials
                
                // Get track model by id 4 - авторизация проверяется автоматически в хуке
                try {
                    const trackResponse = await fetchTrack(4);
                    if (trackResponse.success && trackResponse.data) {
                        const trackData = trackResponse.data;
                        console.log("Track model received:", trackData);
                        setCurrentTrack(trackData as Track);
                        
                        // Stream track - авторизация проверяется автоматически
                        try {
                            const streamResponse = await MusicApi.stream(4);
                            console.log("Stream response status:", streamResponse.status);
                            
                            if (streamResponse.ok) {
                                const blob = await streamResponse.blob();
                                const blobUrl = URL.createObjectURL(blob);
                                console.log("Audio blob created, URL:", blobUrl);
                                setAudioUrl(blobUrl);
                                
                                // Set duration from track data if available
                                if (trackData.durationInSeconds) {
                                    setDuration(trackData.durationInSeconds);
                                }
                            } else {
                                console.error("Stream failed with status:", streamResponse.status);
                            }
                        } catch (error) {
                            console.error("Error streaming track:", error);
                        }
                    } else {
                        console.error("Failed to get track:", trackResponse.errors?.[0] || trackResponse.details?.[0] || trackResponse.message);
                    }
                } catch (error) {
                    console.error("Error getting track:", error);
                }
            } else {
                console.error("Login failed");
            }
        };

        performLogin();
        return () => {
            controller.abort();
        };
    }, [login, fetchTrack]);

    // Cleanup audio URL on unmount
    useEffect(() => {
        return () => {
            if (audioUrl) {
                URL.revokeObjectURL(audioUrl);
            }
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.src = '';
            }
        };
    }, [audioUrl]);

    return (
        <MiniPlayer
            currentTrack={currentTrack}
            isPlaying={isPlaying}
            currentTime={currentTime}
            duration={duration}
            isLiked={isLiked}
            onPlayPause={handlePlayPause}
            onNext={handleNext}
            onPrevious={handlePrevious}
            onSeek={handleSeek}
            onLike={handleLike}
        />
    );
}