import React, { useState, useEffect, useRef, useCallback } from "react"
import {MiniPlayer} from "@widgets/MiniPlayer";
import type {Track} from "@entities/Music";
import { useAuth } from "@shared/lib/auth";
import { useGetTrackQuery } from "@shared/api/rtkApi";
import { Api as MusicApi } from "@entities/Music/api/api";

export const MiniPlayerExample = () => {
    const [currentTime, setCurrentTime] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isLiked, setIsLiked] = useState(false);
    const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
    const [currentTrackId, setCurrentTrackId] = useState<number>(4);
    const [requestedTrackId, setRequestedTrackId] = useState<number | null>(null);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const [duration, setDuration] = useState(0);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const { login } = useAuth();
    
    // RTK Query для получения трека (skip: true для ручной загрузки)
    const { data: trackData, error: trackError } = useGetTrackQuery(
        requestedTrackId ?? 0, 
        { skip: requestedTrackId === null }
    );

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

    // Обработка загруженных данных трека
    useEffect(() => {
        if (!trackData || requestedTrackId === null) return;

        const trackId = requestedTrackId;
        console.log("Track model received:", trackData);
        setCurrentTrack(trackData as Track);
        setCurrentTrackId(trackId);

        // Останавливаем текущее воспроизведение
        if (audioRef.current) {
            audioRef.current.pause();
            setIsPlaying(false);
        }

        // Освобождаем старый URL
        setAudioUrl(prevUrl => {
            if (prevUrl) {
                URL.revokeObjectURL(prevUrl);
            }
            return null;
        });

        // Загружаем stream трека
        const loadStream = async () => {
            try {
                const streamResponse = await MusicApi.stream(trackId);
                console.log("Stream response status:", streamResponse.status);

                if (streamResponse.ok) {
                    const blob = await streamResponse.blob();
                    const blobUrl = URL.createObjectURL(blob);
                    console.log("Audio blob created, URL:", blobUrl);
                    setAudioUrl(blobUrl);

                    // Устанавливаем длительность из данных трека, если доступна
                    if (trackData.durationInSeconds) {
                        setDuration(trackData.durationInSeconds);
                    }
                } else {
                    console.error("Stream failed with status:", streamResponse.status);
                }
            } catch (error) {
                console.error("Error streaming track:", error);
            }
        };

        loadStream();
    }, [trackData, requestedTrackId]);

    // Обработка ошибок загрузки трека
    useEffect(() => {
        if (trackError) {
            console.error("Failed to get track:", trackError);
        }
    }, [trackError]);

    // Функция для загрузки трека по ID
    const loadTrack = useCallback((trackId: number) => {
        if (trackId < 1) {
            console.warn("Track ID must be greater than 0");
            return;
        }

        // Устанавливаем requestedTrackId, что запустит RTK Query запрос
        setRequestedTrackId(trackId);
    }, []);

    const handleNext = () => {
        const nextTrackId = currentTrackId + 1;
        console.log("Next track, loading ID:", nextTrackId);
        loadTrack(nextTrackId);
    };

    const handlePrevious = () => {
        const prevTrackId = currentTrackId - 1;
        if (prevTrackId < 1) {
            console.warn("Cannot go to previous track, ID would be less than 1");
            return;
        }
        console.log("Previous track, loading ID:", prevTrackId);
        loadTrack(prevTrackId);
    };

    const handlePlayPause = () => {
        setIsPlaying(prev => !prev);
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
                
                // Загружаем начальный трек с ID 4
                await loadTrack(4);
            } else {
                console.error("Login failed");
            }
        };

        performLogin();
        return () => {
            controller.abort();
        };
    }, [login, loadTrack]);

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