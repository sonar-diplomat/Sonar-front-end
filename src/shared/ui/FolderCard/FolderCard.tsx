import React, { useState } from 'react';
import styles from './FolderCard.module.css';
import { ItemCard } from '@shared/ui/ItemCard/ItemCard.tsx';
import type { FolderCardProps } from './FolderCard.types.ts';
import {FolderCoverIcon} from "@shared/ui";

export const FolderCard: React.FC<FolderCardProps> = ({ 
    label, 
    size = 'small', 
    onClick, 
    className = '',
    folderId,
    onDrop,
}) => {
    const [isDragging, setIsDragging] = useState(false);
    const [isDraggingOver, setIsDraggingOver] = useState(false);
    
    const wrapperClasses = [
        styles.folderWrapper,
        styles[size],
        className,
        isDragging ? styles.dragging : '',
        isDraggingOver ? styles.draggingOver : '',
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

    const handleDragStart = (e: React.DragEvent) => {
        if (!folderId) return;
        
        setIsDragging(true);
        const dragData = {
            type: 'folder' as const,
            id: folderId,
            name: label,
        };
        e.dataTransfer.setData('application/json', JSON.stringify(dragData));
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragEnd = () => {
        setIsDragging(false);
    };

    const handleDragOver = (e: React.DragEvent) => {
        if (!onDrop) return;
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDragEnter = (e: React.DragEvent) => {
        if (!onDrop) return;
        e.preventDefault();
        setIsDraggingOver(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        if (!onDrop) return;
        // Проверяем, что мы действительно покинули элемент (не перешли на дочерний)
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX;
        const y = e.clientY;
        if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
            setIsDraggingOver(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        if (!onDrop || !folderId) return;
        e.preventDefault();
        setIsDraggingOver(false);
        
        try {
            const data = e.dataTransfer.getData('application/json');
            if (data) {
                const draggedItem = JSON.parse(data);
                
                onDrop({
                    draggedItem,
                    targetFolderId: folderId,
                    moveToParent: false,
                });
            }
        } catch (error) {
            console.error('Error parsing drag data:', error);
        }
    };

    const isDraggable = folderId !== undefined;
    const isDropZone = onDrop !== undefined;

    return (
        <div 
            className={wrapperClasses}
            onClick={handleClick}
            onKeyDown={handleKeyDown}
            role={onClick ? 'button' : undefined}
            tabIndex={onClick ? 0 : undefined}
            draggable={isDraggable}
            onDragStart={isDraggable ? handleDragStart : undefined}
            onDragEnd={isDraggable ? handleDragEnd : undefined}
            onDragOver={isDropZone ? handleDragOver : undefined}
            onDragEnter={isDropZone ? handleDragEnter : undefined}
            onDragLeave={isDropZone ? handleDragLeave : undefined}
            onDrop={isDropZone ? handleDrop : undefined}
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
