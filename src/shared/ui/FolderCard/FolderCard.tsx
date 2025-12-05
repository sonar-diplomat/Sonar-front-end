import React from 'react';
import styles from './FolderCard.module.css';
import { ItemCard } from '@shared/ui/ItemCard/ItemCard.tsx';
import type { FolderCardProps } from './FolderCard.types.ts';
import {FolderCoverIcon} from "@shared/ui";

export const FolderCard: React.FC<FolderCardProps> = ({ label, size = 'small', onClick, className = '' }) => {
    const wrapperClasses = [
        styles.folderWrapper,
        styles[size],
        className,
    ].filter(Boolean).join(' ');

    const handleClick = () => {
        if (onClick) {
            onClick();
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (onClick && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            onClick();
        }
    };

    return (
        <div 
            className={wrapperClasses}
            onClick={handleClick}
            onKeyDown={handleKeyDown}
            role={onClick ? 'button' : undefined}
            tabIndex={onClick ? 0 : undefined}
        >
            <div className={styles.layersContainer}>
                <div className={`${styles.layer} ${styles.layer1}`} />
                <div className={`${styles.layer} ${styles.layer2}`} />
                <div className={`${styles.layer} ${styles.layer3}`} />
                <div className={styles.mainCard}>
                    <ItemCard
                        size={size}
                        backgroundColor="#1F1F1F"
                    />
                </div>
                <div className={styles.label}>{label}</div>
                <FolderCoverIcon className={styles.folderIcon}/>
            </div>
        </div>
    );
};
