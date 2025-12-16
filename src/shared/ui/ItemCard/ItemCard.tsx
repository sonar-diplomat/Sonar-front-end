import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './ItemCard.module.css';
import type {ItemCardProps} from '@shared/ui';
import { LoadingImage } from '@shared/ui';

export const ItemCard: React.FC<ItemCardProps> = ({
    size = 'medium', 
    image, 
    backgroundColor = '#1F1F1F', 
    textContent, 
    onClick, 
    to, 
    state, 
    className = '',
    collectionId,
    collectionName,
}) => {
    const navigate = useNavigate();
    const [isDragging, setIsDragging] = useState(false);
    
    const classNames = [
        styles.card,
        styles[size],
        className,
        isDragging ? styles.dragging : '',
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

    const handleDragStart = (e: React.DragEvent) => {
        if (!collectionId || !collectionName) return;
        
        setIsDragging(true);
        const dragData = {
            type: 'collection' as const,
            id: collectionId,
            name: collectionName,
        };
        e.dataTransfer.setData('application/json', JSON.stringify(dragData));
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragEnd = () => {
        setIsDragging(false);
    };

    const hasAction = to || onClick;
    const isDraggable = collectionId !== undefined && collectionName !== undefined;

    return (
        <div className={styles.cardWrapper}>
            <div
                className={classNames}
                onClick={hasAction ? handleClick : undefined}
                style={{
                    backgroundColor: image ? 'transparent' : backgroundColor,
                }}
                role={hasAction ? 'button' : undefined}
                tabIndex={hasAction ? 0 : undefined}
                onKeyDown={hasAction ? handleKeyDown : undefined}
                draggable={isDraggable}
                onDragStart={isDraggable ? handleDragStart : undefined}
                onDragEnd={isDraggable ? handleDragEnd : undefined}
            >
                {image && (
                    <LoadingImage
                        src={image}
                        alt={textContent?.title || ''}
                        className={styles.cardImage}
                    />
                )}
            </div>
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

