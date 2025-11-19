import React from 'react';
import styles from './ItemCard.module.css';
import type {ItemCardProps} from '@shared/ui';

export const ItemCard: React.FC<ItemCardProps> = ({size = 'medium', image, backgroundColor = '#1F1F1F', textContent, onClick, className = ''}) => {
    const classNames = [
        styles.card,
        styles[size],
        className,
    ].filter(Boolean).join(' ');

    return (
        <div className={styles.cardWrapper}>
            <div
                className={classNames}
                onClick={onClick}
                style={{
                    backgroundColor: image ? 'transparent' : backgroundColor,
                    backgroundImage: image ? `url(${image})` : undefined,
                }}
                role={onClick ? 'button' : undefined}
                tabIndex={onClick ? 0 : undefined}
                onKeyDown={onClick ? (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        onClick();
                    }
                } : undefined}
            />
            {textContent && (
                <div className={`${styles.textContent} ${styles[`textContent_${size}`]}`}>
                    <h3 className={styles.title}>{textContent.title}</h3>
                    {textContent.subtitle1 && (
                        <p className={styles.subtitle}>{textContent.subtitle1}</p>
                    )}
                    {textContent.subtitle2 && (
                        <p className={styles.subtitle}>{textContent.subtitle2}</p>
                    )}
                </div>
            )}
        </div>
    );
};

