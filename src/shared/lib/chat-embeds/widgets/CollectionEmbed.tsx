import React from 'react';
import { useGetAlbumQuery } from '@entities/Album/api/rtkApi';
import { useGetPlaylistQuery } from '@entities/Playlist/api/rtkApi';
import { AlbumEmbed } from './AlbumEmbed';
import { PlaylistEmbed } from './PlaylistEmbed';
import { LoadingPlaceholder } from '@shared/ui';
import styles from './EmbedWidget.module.css';

export interface CollectionEmbedProps {
  collectionId: number;
  url: string;
}

export const CollectionEmbed: React.FC<CollectionEmbedProps> = ({ collectionId, url }) => {
  const albumQuery = useGetAlbumQuery(collectionId, { skip: false });
  const playlistQuery = useGetPlaylistQuery(collectionId, { skip: false });

  if (playlistQuery.isSuccess && playlistQuery.data) {
    const playlist = playlistQuery.data;
    if (playlist.creator || playlist.contributors || (playlist as any).creatorName) {
      return <PlaylistEmbed playlistId={collectionId} url={url} />;
    }
  }

  if (albumQuery.isSuccess && albumQuery.data) {
    const album = albumQuery.data;
    if (album.distributor || album.albumArtists || (album as any).distributorName) {
      return <AlbumEmbed albumId={collectionId} url={url} />;
    }
  }

  if (albumQuery.isLoading || playlistQuery.isLoading) {
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

  return (
    <a href={url} target="_blank" rel="noopener noreferrer" className={styles.fallbackLink}>
      {url}
    </a>
  );
};

