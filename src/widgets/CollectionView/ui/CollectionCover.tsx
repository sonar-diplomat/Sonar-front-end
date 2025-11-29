import React from 'react';
import styles from './CollectionCover.module.css';
import type { CollectionCoverProps } from './CollectionCover.types';
import {Button, PlayIcon, ShuffleIcon} from '@shared/ui';

export const CollectionCover: React.FC<CollectionCoverProps> = ({
    imageSrc,
    imageAlt = 'Collection cover',
    onPlayClick,
    onShuffleClick,
    className = ''
}) => {
    const wrapperClasses = [
        styles.collectionCover,
        className,
    ].filter(Boolean).join(' ');

    return (
        <div
            className={wrapperClasses}
            style={{
                backgroundImage: imageSrc ? `url(${imageSrc})` : undefined,
            }}
            role="img"
            aria-label={imageAlt}
        >
            <div className={styles.playControls}>
                <div className={styles.leftControls}>
                    {onPlayClick && (
                        <Button
                            theme="light"
                            size="medium"
                            icon={<PlayIcon/>}
                            iconOnly
                            onClick={onPlayClick}
                        />
                    )}
                    <p className={styles.playText}>Start listening</p>
                </div>
                {onShuffleClick && (
                    <Button
                        variant="text"
                        theme="dark"
                        size="medium"
                        icon={<ShuffleIcon/>}
                        iconOnly
                        onClick={onShuffleClick}
                    />
                )}
            </div>
        </div>
    );
};