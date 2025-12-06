import React from 'react';
import { useGetChatStickersQuery } from '@entities/ChatSticker';
import { getImageUrlById } from '@shared/lib/image-utils';
import { LoadingPlaceholder } from '@shared/ui';
import styles from './StickerPicker.module.css';

export interface StickerPickerProps {
  onSelect: (stickerId: number) => void;
  onClose: () => void;
}

export const StickerPicker: React.FC<StickerPickerProps> = ({ onSelect, onClose }) => {
  const { data: stickers, isLoading, isError } = useGetChatStickersQuery();

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>Stickers</h3>
        <button className={styles.closeButton} onClick={onClose} aria-label="Close">
          ×
        </button>
      </div>
      {isLoading && (
        <LoadingPlaceholder variant="spinner" text="Loading stickers..." />
      )}
      {(isError || !stickers || stickers.length === 0) && !isLoading && (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>😊</div>
          <div className={styles.emptyText}>No stickers available</div>
          <div className={styles.emptySubtext}>Check back later</div>
        </div>
      )}
      {!isLoading && stickers && stickers.length > 0 && (
        <div className={styles.grid}>
          {stickers.map((sticker) => {
            const imageUrl = getImageUrlById(sticker.imageFileId);
            return (
              <button
                key={sticker.id}
                className={styles.stickerItem}
                onClick={() => onSelect(sticker.id)}
                aria-label={sticker.name}
              >
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt={sticker.name}
                    className={styles.stickerImage}
                    loading="lazy"
                  />
                ) : (
                  <div className={styles.stickerPlaceholder}>{sticker.name}</div>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

