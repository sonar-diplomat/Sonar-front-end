import React from 'react';
import styles from './CollectionCover.module.css';
import type { CollectionCoverProps } from './CollectionCover.types';
import { LoadingImage } from '@shared/ui';

export const CollectionCover: React.FC<CollectionCoverProps> = ({
    imageSrc,
    imageAlt = 'Collection cover',
    className = ''
}) => {
    const wrapperClasses = [
        styles.collectionCover,
        className,
    ].filter(Boolean).join(' ');

    return (
        <div className={wrapperClasses}>
            {imageSrc && (
                <LoadingImage
                    src={imageSrc}
                    alt={imageAlt}
                    className={styles.coverImage}
                />
            )}
        </div>
    );
};