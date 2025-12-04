import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './ItemCard.module.css';
import type {ItemCardProps} from '@shared/ui';

export const ItemCard: React.FC<ItemCardProps> = ({size = 'medium', image, backgroundColor = '#1F1F1F', textContent, onClick, to, state, className = ''}) => {
    const navigate = useNavigate();
    const classNames = [
        styles.card,
        styles[size],
        className,
    ].filter(Boolean).join(' ');

    const handleClick = () => {
        if (to) {
            navigate(to, { state });
        } else if (onClick) {
            onClick();
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleClick();
        }
    };

    const hasAction = to || onClick;

    return (
        <div className={styles.cardWrapper}>
            <div
                className={classNames}
                onClick={hasAction ? handleClick : undefined}
                style={{
                    backgroundColor: image ? 'transparent' : backgroundColor,
                    backgroundImage: image ? `url(${image})` : undefined,
                }}
                role={hasAction ? 'button' : undefined}
                tabIndex={hasAction ? 0 : undefined}
                onKeyDown={hasAction ? handleKeyDown : undefined}
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

