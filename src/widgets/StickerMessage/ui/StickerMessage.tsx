import React from 'react';
import { useGetChatStickersQuery } from '@entities/ChatSticker';
import { getImageUrlById } from '@shared/lib/image-utils';
import { LoadingPlaceholder, LoadingImage } from '@shared/ui';
import styles from './StickerMessage.module.css';

export interface StickerMessageProps {
  stickerId: number;
}

export const StickerMessage: React.FC<StickerMessageProps> = ({ stickerId }) => {
  const { data: stickers, isLoading } = useGetChatStickersQuery();
  
  const sticker = stickers?.find((s) => s.id === stickerId);
  const imageUrl = sticker ? getImageUrlById(sticker.imageFileId) : undefined;

  if (isLoading) {
    return (
      <div className={styles.container}>
        <LoadingPlaceholder variant="skeleton" size="large" style={{ width: '200px', height: '200px' }} />
      </div>
    );
  }

  if (!sticker || !imageUrl) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>Sticker not found</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.imageWrapper}>
        <LoadingImage
          src={imageUrl}
          alt={sticker.name}
          objectFit="contain"
          loading="lazy"
        />
      </div>
    </div>
  );
};

