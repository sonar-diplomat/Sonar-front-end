import React from 'react';
import styles from './ItemCardContainer.module.css';
import type {ItemCardContainerProps} from '@shared/ui';
import { LoadingImage } from '@shared/ui';

export const ItemCardContainer: React.FC<ItemCardContainerProps> = ({title, count, countLabel, avatar, children, className = ''}) => {
    return (
        <div className={`${styles.container} ${className}`}>
            <div className={styles.header}>
                {avatar && (
                    <div className={styles.avatarWrapper}>
                        <LoadingImage src={avatar} alt="" className={styles.avatar}/>
                    </div>
                )}
                <div className={styles.headerText}>
                    <h2 className={styles.title}>{title}</h2>
                    <p className={styles.counter}>
                        {count} {countLabel}
                    </p>
                </div>
            </div>
            <div className={styles.cardsScroll}>
                <div className={styles.cardsRow}>
                    {children}
                </div>
            </div>
        </div>
    );
};

