import React from 'react';
import { LoadingPlaceholder, ItemCardContainer } from '@shared/ui';
import styles from './LibrarySkeleton.module.css';

export const LibrarySkeleton: React.FC = () => {
  return (
    <div className={styles.container}>
      {/* Folders section skeleton */}
      <ItemCardContainer title="Folders" count={2} countLabel="folders">
        {[1, 2].map((i) => (
          <div key={i} className={styles.folderSkeleton}>
            <LoadingPlaceholder variant="skeleton" size="large" style={{ width: '123px', height: '123px', borderRadius: '16px' }} />
          </div>
        ))}
      </ItemCardContainer>

      {/* Playlists section skeleton */}
      <ItemCardContainer title="Playlists" count={4} countLabel="playlists">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className={styles.playlistSkeleton}>
            <LoadingPlaceholder variant="skeleton" size="large" style={{ width: '150px', height: '150px', borderRadius: '32px' }} />
            <LoadingPlaceholder variant="skeleton" size="small" style={{ width: '90%', height: '16px', marginTop: '8px' }} />
            <LoadingPlaceholder variant="skeleton" size="small" style={{ width: '60%', height: '14px', marginTop: '4px' }} />
          </div>
        ))}
      </ItemCardContainer>
    </div>
  );
};

