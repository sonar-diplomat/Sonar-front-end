import { useEffect } from 'react';
import { useAppSelector } from '@shared/store/hooks';
import { useGetTrackQuery } from '@shared/api';
import { usePlayTrack } from './usePlaybackActions';

/**
 * Компонент для синхронизации userState.currentTrackId с player
 * Автоматически загружает и запускает трек когда изменяется currentTrackId
 */
export const UserStatePlayerSync = () => {
  const currentTrackId = useAppSelector((state) => state.userState.currentTrackId);
  const playTrack = usePlayTrack();

  // Загружаем трек когда currentTrackId изменяется
  const { data: trackData } = useGetTrackQuery(currentTrackId || 0, {
    skip: !currentTrackId,
  });

  // Автоматически запускаем трек когда он загружается после обновления listening target
  useEffect(() => {
    if (trackData && currentTrackId) {
      // Запускаем трек в плеере
      playTrack(trackData);
      console.log('[UserStatePlayerSync] Track loaded and started playing:', trackData);
    }
  }, [trackData, currentTrackId, playTrack]);

  return null;
};


