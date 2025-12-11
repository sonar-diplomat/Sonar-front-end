import React from 'react';
import styles from './CollectionCover.module.css';
import type { CollectionCoverProps } from './CollectionCover.types';

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
                <img
                    src={imageSrc}
                    alt={imageAlt}
                    className={styles.coverImage}
                />
            )}
        </div>
    );
};