import React from 'react';
import styles from './CollectionHeader.module.css';
import type { CollectionHeaderProps } from './CollectionHeader.types';
import { Button, LeftArrow, MoreIcon } from '@shared/ui';

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
                    onClick={onBackClick}
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
                    onClick={onMenuClick}
                    iconOnly
                    className={styles.menuButton}
                />
            )}
        </div>
    );
};