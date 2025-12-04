import { useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../../index';
import {
  setCurrentTrack,
  setQueue,
  addToQueue,
  addToQueueNext,
  removeFromQueue,
  clearQueue,
  setPendingTrack,
  confirmTrackSwitch,
  playTrack,
  playNext,
  playPrevious,
  togglePlayPause,
  play,
  pause,
  setCurrentTime,
  setDuration,
  setVolume,
  toggleMute,
  setRepeatMode,
  toggleShuffle,
  toggleFavoriteTrack,
  setFavoriteTracks,
} from './playerSlice';
import type { TrackDTO } from '@entities/Music';

export const usePlayer = () => {
  const dispatch = useDispatch();
  const playerState = useSelector((state: RootState) => state.player);

  const handleSetCurrentTrack = useCallback(
    (track: TrackDTO | null) => {
      dispatch(setCurrentTrack(track));
    },
    [dispatch]
  );

  const handleSetQueue = useCallback(
    (tracks: TrackDTO[], startIndex?: number, collectionContext?: { type: 'playlist' | 'album' | 'blend'; id: number }) => {
      dispatch(setQueue({ tracks, startIndex, collectionContext }));
    },
    [dispatch]
  );

  const handleAddToQueue = useCallback(
    (track: TrackDTO) => {
      dispatch(addToQueue(track));
    },
    [dispatch]
  );

  const handleAddToQueueNext = useCallback(
    (track: TrackDTO) => {
      dispatch(addToQueueNext(track));
    },
    [dispatch]
  );

  const handleRemoveFromQueue = useCallback(
    (index: number) => {
      dispatch(removeFromQueue(index));
    },
    [dispatch]
  );

  const handleClearQueue = useCallback(() => {
    dispatch(clearQueue());
  }, [dispatch]);

  const handleSetPendingTrack = useCallback(
    (track: TrackDTO | null) => {
      dispatch(setPendingTrack(track));
    },
    [dispatch]
  );

  const handleConfirmTrackSwitch = useCallback(() => {
    dispatch(confirmTrackSwitch());
  }, [dispatch]);

  const handlePlayTrack = useCallback(
    (track: TrackDTO) => {
      dispatch(playTrack(track));
    },
    [dispatch]
  );

  const handlePlayNext = useCallback(() => {
    dispatch(playNext());
  }, [dispatch]);

  const handlePlayPrevious = useCallback(() => {
    dispatch(playPrevious());
  }, [dispatch]);

  const handleTogglePlayPause = useCallback(() => {
    dispatch(togglePlayPause());
  }, [dispatch]);

  const handlePlay = useCallback(() => {
    dispatch(play());
  }, [dispatch]);

  const handlePause = useCallback(() => {
    dispatch(pause());
  }, [dispatch]);

  const handleSetCurrentTime = useCallback(
    (time: number) => {
      dispatch(setCurrentTime(time));
    },
    [dispatch]
  );

  const handleSetDuration = useCallback(
    (duration: number) => {
      dispatch(setDuration(duration));
    },
    [dispatch]
  );

  const handleSetVolume = useCallback(
    (volume: number) => {
      dispatch(setVolume(volume));
    },
    [dispatch]
  );

  const handleToggleMute = useCallback(() => {
    dispatch(toggleMute());
  }, [dispatch]);

  const handleSetRepeatMode = useCallback(
    (mode: 'off' | 'one' | 'all') => {
      dispatch(setRepeatMode(mode));
    },
    [dispatch]
  );

  const handleToggleShuffle = useCallback(() => {
    dispatch(toggleShuffle());
  }, [dispatch]);

  const handleToggleFavoriteTrack = useCallback(
    (trackId: number) => {
      dispatch(toggleFavoriteTrack(trackId));
    },
    [dispatch]
  );

  const handleSetFavoriteTracks = useCallback(
    (trackIds: number[]) => {
      dispatch(setFavoriteTracks(trackIds));
    },
    [dispatch]
  );

  return {
    ...playerState,
    setCurrentTrack: handleSetCurrentTrack,
    setQueue: handleSetQueue,
    addToQueue: handleAddToQueue,
    addToQueueNext: handleAddToQueueNext,
    removeFromQueue: handleRemoveFromQueue,
    clearQueue: handleClearQueue,
    setPendingTrack: handleSetPendingTrack,
    confirmTrackSwitch: handleConfirmTrackSwitch,
    playTrack: handlePlayTrack,
    playNext: handlePlayNext,
    playPrevious: handlePlayPrevious,
    togglePlayPause: handleTogglePlayPause,
    play: handlePlay,
    pause: handlePause,
    setCurrentTime: handleSetCurrentTime,
    setDuration: handleSetDuration,
    setVolume: handleSetVolume,
    toggleMute: handleToggleMute,
    setRepeatMode: handleSetRepeatMode,
    toggleShuffle: handleToggleShuffle,
    toggleFavoriteTrackLocal: handleToggleFavoriteTrack,
    setFavoriteTracks: handleSetFavoriteTracks,
  };
};

