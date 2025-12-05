import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useGetTrackQuery } from '@entities/Music/api/rtkApi';
import { API_BASE_URL, API_ENDPOINTS } from '@shared/config';
import styles from './EmbedWidget.module.css';

export interface TrackEmbedProps {
  trackId: number;
  url: string;
}

export const TrackEmbed: React.FC<TrackEmbedProps> = ({ trackId, url }) => {
  const navigate = useNavigate();
  const { data: track, isLoading, isError } = useGetTrackQuery(trackId, { skip: !trackId });

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

  if (isError || !track) {
    return (
      <a href={url} target="_blank" rel="noopener noreferrer" className={styles.fallbackLink}>
        {url}
      </a>
    );
  }

  const coverImageUrl = track.coverId
    ? `${API_BASE_URL}${API_ENDPOINTS.blob.image(track.coverId)}`
    : undefined;

  return (
    <div className={styles.embed} onClick={handleClick} role="button" tabIndex={0}>
      <div
        className={styles.cover}
        style={{ backgroundImage: coverImageUrl ? `url(${coverImageUrl})` : 'none' }}
      />
      <div className={styles.content}>
        <div className={styles.titleRow}>
          <span className={styles.title}>{track.title}</span>
          {track.duration && <span className={styles.separator}>•</span>}
          {track.duration && <span className={styles.duration}>{track.duration}</span>}
        </div>
      </div>
    </div>
  );
};

