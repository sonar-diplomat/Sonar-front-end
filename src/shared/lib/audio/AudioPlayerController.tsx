import { useEffect, useRef, useCallback } from 'react';
import { usePlayer } from '@shared/store/features/player';
import { Api as MusicApi } from '@entities/Music/api/api';
import React from "react";

export const AudioPlayerController = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const pendingAudioRef = useRef<HTMLAudioElement | null>(null);
  const isPlayingRef = useRef<boolean>(false);
  const {
    currentTrack,
    pendingTrack,
    isLoadingNextTrack,
    isPlaying,
    volume,
    isMuted,
    queueIndex,
    setCurrentTime,
    setDuration,
    confirmTrackSwitch,
    playNext,
  } = usePlayer();

  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

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

    audio.addEventListener('durationchange', handleDurationChange);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError as any);

    return () => {
      audio.removeEventListener('durationchange', handleDurationChange);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError as any);
    };
  }, [setDuration, playNext]);

  // Используем requestAnimationFrame для более частого обновления времени воспроизведения
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !isPlaying) return;

    let animationFrameId: number;
    let lastTime = audio.currentTime;

    const updateTime = () => {
      if (!audio || audio.paused) {
        return;
      }

      const currentAudioTime = audio.currentTime;
      
      // Обновляем только если время изменилось (избегаем лишних обновлений)
      if (Math.abs(currentAudioTime - lastTime) > 0.01) {
        setCurrentTime(currentAudioTime);
        lastTime = currentAudioTime;
      }

      animationFrameId = requestAnimationFrame(updateTime);
    };

    animationFrameId = requestAnimationFrame(updateTime);

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [isPlaying, setCurrentTime]);

  // Загрузка текущего трека (если нет pendingTrack)
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentTrack || pendingTrack) {
      // Если есть pendingTrack, не загружаем currentTrack заново
      if (audio && audio.src && !pendingTrack) {
        // Продолжаем воспроизведение текущего трека
        return;
      }
      if (audio && audio.src && !currentTrack) {
        audio.pause();
        audio.removeAttribute('src');
        audio.load();
      }
      return;
    }

    audio.pause();
    audio.currentTime = 0;
    setCurrentTime(0);

    let blobUrl: string | null = null;

    const loadTrack = async () => {
      try {
        console.log('[AudioPlayer] Streaming current track:', currentTrack.id);

        const response = await MusicApi.stream(currentTrack.id);

        if (!response || !response.ok) {
          throw new Error(`Stream API returned status: ${response?.status || 'unknown'}`);
        }

        const blob = await response.blob();
        blobUrl = URL.createObjectURL(blob);

        console.log('[AudioPlayer] Current track stream loaded successfully');

        audio.src = blobUrl;
        audio.load();

        if (isPlayingRef.current) {
          const handleCanPlay = () => {
            audio.removeEventListener('canplay', handleCanPlay);
            audio.play().catch((error) => {
              console.error('[AudioPlayer] Error auto-playing new track:', error);
            });
          };

          if (audio.readyState >= 3) {
            audio.play().catch((error) => {
              console.error('[AudioPlayer] Error auto-playing new track:', error);
            });
          } else {
            audio.addEventListener('canplay', handleCanPlay);
          }
        }
      } catch (error) {
        console.error('[AudioPlayer] Error loading current track:', error);
        console.error('[AudioPlayer] Track data:', currentTrack);
      }
    };

    void loadTrack();

    return () => {
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
      }
    };
  }, [queueIndex, currentTrack?.id, pendingTrack, setCurrentTime]);

  // Предзагрузка pendingTrack в фоне
  useEffect(() => {
    if (!pendingTrack || !isLoadingNextTrack) {
      return;
    }

    // Создаем отдельный audio элемент для предзагрузки
    if (!pendingAudioRef.current) {
      pendingAudioRef.current = new Audio();
    }

    const pendingAudio = pendingAudioRef.current;
    let blobUrl: string | null = null;
    let isCancelled = false;

    const preloadTrack = async () => {
      try {
        console.log('[AudioPlayer] Preloading pending track:', pendingTrack.id);

        const response = await MusicApi.stream(pendingTrack.id);

        if (!response || !response.ok) {
          throw new Error(`Stream API returned status: ${response?.status || 'unknown'}`);
        }

        const blob = await response.blob();
        blobUrl = URL.createObjectURL(blob);

        if (isCancelled) {
          URL.revokeObjectURL(blobUrl);
          return;
        }

        console.log('[AudioPlayer] Pending track preloaded successfully');

        // Предзагружаем трек (без воспроизведения)
        pendingAudio.src = blobUrl;
        pendingAudio.volume = 0; // Убеждаемся, что pendingAudio не слышен
        pendingAudio.load();
        
        // Убеждаемся, что pendingAudio не воспроизводится
        if (!pendingAudio.paused) {
          pendingAudio.pause();
        }

        // Ждем пока трек будет готов к воспроизведению
        await new Promise<void>((resolve, reject) => {
          if (isCancelled) {
            reject(new Error('Preload cancelled'));
            return;
          }

          const handleCanPlay = () => {
            pendingAudio.removeEventListener('canplay', handleCanPlay);
            pendingAudio.removeEventListener('error', handleError);
            if (!isCancelled) {
              resolve();
            }
          };

          const handleError = () => {
            pendingAudio.removeEventListener('canplay', handleCanPlay);
            pendingAudio.removeEventListener('error', handleError);
            if (!isCancelled) {
              reject(new Error('Failed to preload pending track'));
            }
          };

          if (pendingAudio.readyState >= 3) {
            // HAVE_FUTURE_DATA или выше - трек готов
            resolve();
          } else {
            pendingAudio.addEventListener('canplay', handleCanPlay);
            pendingAudio.addEventListener('error', handleError);
          }
        });

        if (isCancelled) {
          if (blobUrl) {
            URL.revokeObjectURL(blobUrl);
          }
          return;
        }

        console.log('[AudioPlayer] Pending track is ready, switching...');

        // Переключаемся на предзагруженный трек с плавным переходом
        const mainAudio = audioRef.current;
        if (mainAudio && !isCancelled) {
          // Сохраняем blobUrl для использования в mainAudio
          const trackBlobUrl = blobUrl;
          blobUrl = null; // Не освобождаем в cleanup, так как используется в mainAudio

          // Плавное переключение с fade out/in
          const fadeDuration = 300; // Длительность fade в миллисекундах (увеличено для более плавного перехода)
          const steps = 30; // Количество шагов для плавности
          const stepDuration = fadeDuration / steps;
          const targetVolume = isMuted ? 0 : volume;
          const volumeStep = targetVolume / steps;

          // Fade out текущего трека
          const currentVolume = mainAudio.volume;
          let currentStep = 0;
          let fadeOutInterval: NodeJS.Timeout | null = null;

          const cleanupFade = () => {
            if (fadeOutInterval) {
              clearInterval(fadeOutInterval);
              fadeOutInterval = null;
            }
          };

          fadeOutInterval = setInterval(() => {
            if (isCancelled) {
              cleanupFade();
              return;
            }

            currentStep++;
            const newVolume = Math.max(0, currentVolume - (volumeStep * currentStep));
            mainAudio.volume = newVolume;

            if (currentStep >= steps) {
              cleanupFade();
              
              if (!isCancelled) {
                // Полностью останавливаем старый трек перед переключением
                mainAudio.pause();
                mainAudio.currentTime = 0;
                
                // Убеждаемся, что pendingAudio не воспроизводится
                if (pendingAudio && !pendingAudio.paused) {
                  pendingAudio.pause();
                }

                // Небольшая задержка для полной остановки старого трека
                setTimeout(() => {
                  if (isCancelled) return;

                  // Переключаем src на предзагруженный трек
                  mainAudio.src = trackBlobUrl;
                  mainAudio.load();

                  // Начинаем с начала нового трека
                  mainAudio.currentTime = 0;

                  // Запускаем воспроизведение если было включено
                  if (isPlaying) {
                    mainAudio.play().then(() => {
                      // Fade in нового трека
                      mainAudio.volume = 0;
                      let fadeInStep = 0;
                      
                      const fadeInInterval = setInterval(() => {
                        fadeInStep++;
                        const newVolume = Math.min(targetVolume, volumeStep * fadeInStep);
                        mainAudio.volume = newVolume;

                        if (fadeInStep >= steps) {
                          clearInterval(fadeInInterval);
                          mainAudio.volume = targetVolume;
                        }
                      }, stepDuration);
                    }).catch((error) => {
                      console.error('[AudioPlayer] Error playing new track:', error);
                      mainAudio.volume = targetVolume;
                    });
                  } else {
                    // Если не играет, просто устанавливаем громкость
                    mainAudio.volume = targetVolume;
                  }

                  // Подтверждаем переключение в Redux
                  confirmTrackSwitch();
                  
                  console.log('[AudioPlayer] Track switched successfully');
                }, 50); // Небольшая задержка для полной остановки
              }

              // Освобождаем blobUrl после небольшой задержки
              setTimeout(() => {
                URL.revokeObjectURL(trackBlobUrl);
              }, 1000);
            }
          }, stepDuration);
        }

        // Очищаем pending audio
        pendingAudio.removeAttribute('src');
        pendingAudio.load();
      } catch (error) {
        if (!isCancelled) {
          console.error('[AudioPlayer] Error preloading pending track:', error);
          console.error('[AudioPlayer] Pending track data:', pendingTrack);
        }
        if (blobUrl) {
          URL.revokeObjectURL(blobUrl);
        }
      }
    };

    void preloadTrack();

    return () => {
      isCancelled = true;
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
      }
      // Очищаем pending audio при отмене
      if (pendingAudio.src) {
        pendingAudio.removeAttribute('src');
        pendingAudio.load();
      }
    };
  }, [pendingTrack, isLoadingNextTrack, isPlaying, confirmTrackSwitch]);

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

