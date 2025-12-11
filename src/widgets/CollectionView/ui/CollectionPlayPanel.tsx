import React from 'react';
import styles from './CollectionPlayPanel.module.css';
import type { CollectionPlayPanelProps } from './CollectionPlayPanel.types';
import { Button, PlayIcon, ShuffleIcon } from '@shared/ui';

export const CollectionPlayPanel: React.FC<CollectionPlayPanelProps> = ({
    onPlayClick,
    onShuffleClick,
    className = ''
}) => {
    const wrapperClasses = [
        styles.collectionPlayPanel,
        className,
    ].filter(Boolean).join(' ');

    return (
        <div className={wrapperClasses}>
            <div className={styles.leftControls}>
                {onPlayClick && (
                    <Button
                        variant="filled"
                        theme="light"
                        size="medium"
                        shape="cr-16"
                        icon={<PlayIcon/>}
                        iconOnly
                        onClick={onPlayClick}
                    />
                )}
                <p className={styles.playText}>Start listening</p>
            </div>
            {onShuffleClick && (
                <Button
                    variant="filled"
                    theme="dark"
                    size="medium"
                    shape="cr-16"
                    icon={<ShuffleIcon/>}
                    iconOnly
                    onClick={onShuffleClick}
                />
            )}
        </div>
    );
};

