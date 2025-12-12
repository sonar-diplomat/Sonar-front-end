import React from 'react';
import styles from './CollectionPlayPanel.module.css';
import type { CollectionPlayPanelProps } from './CollectionPlayPanel.types';
import { Button, PlayIcon, PauseIcon, ShuffleIcon } from '@shared/ui';

export const CollectionPlayPanel: React.FC<CollectionPlayPanelProps> = ({
    onPlayClick,
    onShuffleClick,
    isPlaying = false,
    isCurrentCollection = false,
    className = ''
}) => {
    const wrapperClasses = [
        styles.collectionPlayPanel,
        className,
    ].filter(Boolean).join(' ');

    const showPauseIcon = isCurrentCollection && isPlaying;
    const playText = showPauseIcon ? 'Pause' : 'Start listening';

    return (
        <div className={wrapperClasses}>
            <div className={styles.leftControls}>
                {onPlayClick && (
                    <Button
                        variant="filled"
                        theme="light"
                        size="medium"
                        shape="cr-16"
                        icon={showPauseIcon ? <PauseIcon/> : <PlayIcon/>}
                        iconOnly
                        onClick={onPlayClick}
                    />
                )}
                <p className={styles.playText}>{playText}</p>
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

