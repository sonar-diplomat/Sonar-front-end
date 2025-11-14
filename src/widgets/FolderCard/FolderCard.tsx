import React from 'react';
import styles from './FolderCard.module.css';
import { ItemCard } from '@shared/ui/ItemCard/ItemCard.tsx';
import type { FolderCardProps } from './FolderCard.types.ts';

export const FolderCard: React.FC<FolderCardProps> = ({ label, size = 'medium', onClick, className = '' }) => {
    const wrapperClasses = [
        styles.folderWrapper,
        styles[size],
        className,
    ].filter(Boolean).join(' ');

    return (
        <div className={wrapperClasses}>
            <div className={styles.layersContainer}>
                <div className={`${styles.layer} ${styles.layer1}`} />I
                <div className={`${styles.layer} ${styles.layer2}`} />
                <div className={`${styles.layer} ${styles.layer3}`} />
                <div className={styles.mainCard}>
                    <ItemCard
                        size={size}
                        backgroundColor="#1F1F1F"
                        onClick={onClick}
                    />
                </div>
            </div>
            <p className={styles.label}>{label}</p>
        </div>
    );
};
