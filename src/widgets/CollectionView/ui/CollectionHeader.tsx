import React from 'react';
import styles from './CollectionHeader.module.css';
import type { CollectionHeaderProps } from './CollectionHeader.types';
import { LeftArrow, MoreIcon } from '@shared/ui';

export const CollectionHeader: React.FC<CollectionHeaderProps> = ({
    title = 'Your mix',
    onBackClick,
    onMenuClick,
    className = ''
}) => {
    const wrapperClasses = [
        styles.collectionHeader,
        className,
    ].filter(Boolean).join(' ');

    return (
        <div className={wrapperClasses}>
            {onBackClick && (
                <button
                    className={styles.backButton}
                    onClick={onBackClick}
                    aria-label="Go back"
                >
                    <LeftArrow className={styles.backIcon} />
                </button>
            )}
            <h1 className={styles.title}>{title}</h1>
            {onMenuClick && (
                <button
                    className={styles.menuButton}
                    onClick={onMenuClick}
                    aria-label="More options"
                >
                    <MoreIcon className={styles.menuIcon} />
                </button>
            )}
        </div>
    );
};