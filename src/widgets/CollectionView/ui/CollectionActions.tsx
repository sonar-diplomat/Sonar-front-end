import React from 'react';
import styles from './CollectionActions.module.css';
import type {CollectionActionsProps} from '@widgets/CollectionView';
import { Button, EditIcon, SortIcon } from '@shared/ui';

export const CollectionActions: React.FC<CollectionActionsProps> = ({
    onEditClick,
    onSortClick,
    sortBy = 'none',
    className = ''
}) => {
    const wrapperClasses = [
        styles.collectionActions,
        className,
    ].filter(Boolean).join(' ');

    const getSortLabel = () => {
        if (sortBy === 'title') return 'Sort: Title';
        if (sortBy === 'artist') return 'Sort: Artist';
        return 'Sort';
    };

    return (
        <div className={wrapperClasses}>
            {onEditClick && (
                <Button
                    size={"small"}
                    shape={"cr-16"}
                    icon={<EditIcon/>}
                    theme={"dark"}
                    children={"edit"}
                    onClick={onEditClick}
                />
            )}
            {onSortClick && (
                <Button
                    size={"small"}
                    shape={"cr-16"}
                    icon={<SortIcon/>}
                    theme={"dark"}
                    children={getSortLabel()}
                    onClick={onSortClick}
                />
            )}
        </div>
    );
};