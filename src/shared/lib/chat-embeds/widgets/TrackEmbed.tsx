import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useGetTrackQuery } from '@entities/Music/api/rtkApi';
import { API_BASE_URL, API_ENDPOINTS } from '@shared/config';
import { LoadingPlaceholder, LoadingImage } from '@shared/ui';
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
        <LoadingPlaceholder variant="skeleton" size="medium" className={styles.cover} />
        <div className={styles.content}>
          <LoadingPlaceholder variant="skeleton" size="small" />
          <LoadingPlaceholder variant="skeleton" size="small" style={{ width: '60%', marginTop: '8px' }} />
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
      <div className={styles.cover}>
        {coverImageUrl && (
          <LoadingImage
            src={coverImageUrl}
            alt={track.title}
            className={styles.coverImage}
          />
        )}
      </div>
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

