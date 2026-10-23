import React from 'react';

import { useNavigate } from 'react-router-dom';

import { useGetTrackQuery } from '@entities/Music/api/rtkApi';
import { getImageUrlById } from '@shared/lib/image-utils';
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
    navigate(`/track/${trackId}`);
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

  const coverImageUrl = getImageUrlById(track.coverId);

  return (
    <div className={styles.embed} onClick={handleClick} role="button" tabIndex={0} onKeyDown={event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); handleClick(); } }}>
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
