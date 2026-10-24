import React from 'react';

import { Button,LeftArrow,MoreIcon } from '@shared/ui';

import styles from './CollectionHeader.module.css';
import type { CollectionHeaderProps } from './CollectionHeader.types';

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
                <Button
                    variant="filled"
                    theme="dark"
                    size="medium"
                    shape="cr-16"
                    icon={<LeftArrow />}
                    aria-label="Back" onClick={onBackClick}
                    iconOnly
                    className={styles.backButton}
                />
            )}
            <h1 className={styles.title}>{title}</h1>
            {onMenuClick && (
                <Button
                    variant="filled"
                    theme="dark"
                    size="medium"
                    shape="cr-16"
                    icon={<MoreIcon />}
                    aria-label="Collection actions" onClick={onMenuClick}
                    iconOnly
                    className={styles.menuButton}
                />
            )}
        </div>
    );
};
