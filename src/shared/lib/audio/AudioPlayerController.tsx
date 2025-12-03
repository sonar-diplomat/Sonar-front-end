import { useEffect, useRef, useCallback } from 'react';
import { usePlayer } from '@shared/store/features/player';
import { Api as MusicApi } from '@entities/Music/api/api';
import React from "react";

export const AudioPlayerController = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const {
    currentTrack,
    isPlaying,
    volume,
    isMuted,
    setCurrentTime,
    setDuration,
    playNext,
  } = usePlayer();

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleDurationChange = () => {
      setDuration(audio.duration);
    };

    const handleEnded = () => {
      playNext();
    };

    const handleError = (e: Event) => {
      const audioElement = e.target as HTMLAudioElement;
      const error = audioElement.error;

      if (error) {
        console.error('[AudioPlayer] Playback error:', {
          code: error.code,
          message: error.message,
          src: audioElement.src,
          networkState: audioElement.networkState,
          readyState: audioElement.readyState,
        });

        switch (error.code) {
          case 1:
            console.warn('[AudioPlayer] Media loading was aborted');
            break;
          case 2:
            console.error('[AudioPlayer] Network error while loading media');
            break;
          case 3:
            console.error('[AudioPlayer] Media decoding failed');
            break;
          case 4:
            console.error('[AudioPlayer] Media format not supported or source not found');
            break;
          default:
            console.error('[AudioPlayer] Unknown media error');
        }
      } else {
        console.error('[AudioPlayer] Audio error event without error object:', e);
      }
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('durationchange', handleDurationChange);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError as any);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('durationchange', handleDurationChange);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError as any);
    };
  }, [setCurrentTime, setDuration, playNext]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentTrack) {
      if (audio && audio.src) {
        audio.pause();
        audio.removeAttribute('src');
        audio.load();
      }
      return;
    }

    let blobUrl: string | null = null;

    const loadTrack = async () => {
      try {
        console.log('[AudioPlayer] Streaming track:', currentTrack.id);

        const response = await MusicApi.stream(currentTrack.id);

        if (!response || !response.ok) {
          throw new Error(`Stream API returned status: ${response?.status || 'unknown'}`);
        }

        const blob = await response.blob();
        blobUrl = URL.createObjectURL(blob);

        console.log('[AudioPlayer] Stream loaded successfully');

        audio.src = blobUrl;
        audio.load();

        if (isPlaying) {
          await audio.play();
        }
      } catch (error) {
        console.error('[AudioPlayer] Error loading track:', error);
        console.error('[AudioPlayer] Track data:', currentTrack);
      }
    };

    void loadTrack();

    return () => {
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
      }
    };
  }, [currentTrack]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !audio.src || audio.src === '' || audio.src === window.location.href) {
      return;
    }

    if (isPlaying) {
      audio.play().catch((error) => {
        console.error('[AudioPlayer] Error playing audio:', error);
      });
    } else {
      audio.pause();
    }
  }, [isPlaying]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = isMuted ? 0 : volume;
  }, [volume, isMuted]);

  return <audio ref={audioRef} preload="auto" style={{ display: 'none' }} />;
};

export const useAudioSeek = () => {
  const { setCurrentTime } = usePlayer();

  return useCallback(
    (time: number) => {
      const audio = document.querySelector('audio');
      if (audio) {
        audio.currentTime = time;
        setCurrentTime(time);
      }
    },
    [setCurrentTime]
  );
};

