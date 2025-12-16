import React from 'react';
import styles from './ArtistItem.module.css';
import type { ArtistItemProps } from '@shared/ui';
import { LoadingImage } from '@shared/ui';

export const ArtistItem: React.FC<ArtistItemProps> = ({
    rank,
    name,
    imageSrc,
    imageAlt = '',
    className = ''
}) => {
    const wrapperClasses = [
        styles.artistItem,
        className,
    ].filter(Boolean).join(' ');

    return (
        <div className={wrapperClasses}>
            <div className={styles.content}>
                <LoadingImage
                    src={imageSrc}
                    alt={imageAlt}
                    className={styles.image}
                />
                <div className={styles.nameContainer}>
                    <p className={styles.name}>{name}</p>
                </div>
            </div>
            <div className={styles.rankContainer}>
                <p className={styles.rank}>{rank}.</p>
            </div>
        </div>
    );
};