import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useGetPlaylistQuery } from '@entities/Playlist/api/rtkApi';
import { API_BASE_URL, API_ENDPOINTS } from '@shared/config';
import styles from './EmbedWidget.module.css';

export interface PlaylistEmbedProps {
  playlistId: number;
  url: string;
}

export const PlaylistEmbed: React.FC<PlaylistEmbedProps> = ({ playlistId, url }) => {
  const navigate = useNavigate();
  const { data: playlist, isLoading, isError } = useGetPlaylistQuery(playlistId, { skip: !playlistId });

  const handleClick = () => {
    const path = new URL(url).pathname;
    navigate(path);
  };

  if (isLoading) {
    return (
      <div className={styles.embed}>
        <div className={styles.loadingSkeleton} />
        <div className={styles.loadingContent}>
          <div className={styles.loadingLine} />
          <div className={styles.loadingLineShort} />
        </div>
      </div>
    );
  }

  if (isError || !playlist) {
    return (
      <a href={url} target="_blank" rel="noopener noreferrer" className={styles.fallbackLink}>
        {url}
      </a>
    );
  }

  const coverImageUrl = playlist.coverId
    ? `${API_BASE_URL}${API_ENDPOINTS.blob.image(playlist.coverId)}`
    : undefined;

  const creatorName = (playlist as any).creatorName || '';

  return (
    <div className={styles.embed} onClick={handleClick} role="button" tabIndex={0}>
      <div className={styles.type}>Playlist</div>
      <div
        className={styles.cover}
        style={{ backgroundImage: coverImageUrl ? `url(${coverImageUrl})` : 'none' }}
      />
      <div className={styles.content}>
        <div className={styles.titleRow}>
          <span className={styles.title}>{playlist.name}</span>
          {creatorName && <span className={styles.separator}>•</span>}
          {creatorName && <span className={styles.creator}>{creatorName}</span>}
        </div>
      </div>
    </div>
  );
};

