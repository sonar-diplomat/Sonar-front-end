import React from 'react';
import { useGetChatStickersQuery } from '@entities/ChatSticker';
import { getImageUrlById } from '@shared/lib/image-utils';
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
        <div className={styles.loadingSkeleton} />
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
      <img
        src={imageUrl}
        alt={sticker.name}
        className={styles.stickerImage}
        loading="lazy"
      />
    </div>
  );
};

