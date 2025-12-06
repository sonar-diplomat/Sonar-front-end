import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useGetAlbumQuery } from '@entities/Album/api/rtkApi';
import { API_BASE_URL, API_ENDPOINTS } from '@shared/config';
import { LoadingPlaceholder } from '@shared/ui';
import styles from './EmbedWidget.module.css';

export interface AlbumEmbedProps {
  albumId: number;
  url: string;
}

export const AlbumEmbed: React.FC<AlbumEmbedProps> = ({ albumId, url }) => {
  const navigate = useNavigate();
  const { data: album, isLoading, isError } = useGetAlbumQuery(albumId, { skip: !albumId });

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

  if (isError || !album) {
    return (
      <a href={url} target="_blank" rel="noopener noreferrer" className={styles.fallbackLink}>
        {url}
      </a>
    );
  }

  const coverImageUrl = album.coverId
    ? `${API_BASE_URL}${API_ENDPOINTS.blob.image(album.coverId)}`
    : undefined;

  // AlbumResponseDTO имеет distributorName и authors, но AlbumDTO может иметь distributor и albumArtists
  const authors = album.albumArtists?.map((aa) => aa.pseudonym).join(', ') || (album as any).distributorName || '';

  return (
    <div className={styles.embed} onClick={handleClick} role="button" tabIndex={0}>
      <div className={styles.type}>Album</div>
      <div
        className={styles.cover}
        style={{ backgroundImage: coverImageUrl ? `url(${coverImageUrl})` : 'none' }}
      />
      <div className={styles.content}>
        <div className={styles.titleRow}>
          <span className={styles.title}>{album.name}</span>
          {authors && <span className={styles.separator}>•</span>}
          {authors && <span className={styles.creator}>{authors}</span>}
        </div>
      </div>
    </div>
  );
};

