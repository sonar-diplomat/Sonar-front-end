import React from 'react';
import styles from './CollectionActions.module.css';
import type { CollectionActionsProps } from './CollectionActions.types';
import {PlusIcon, Button, EditIcon, SortIcon} from '@shared/ui';

export const CollectionActions: React.FC<CollectionActionsProps> = ({
    onAddClick,
    onEditClick,
    onSortClick,
    className = ''
}) => {
    const wrapperClasses = [
        styles.collectionActions,
        className,
    ].filter(Boolean).join(' ');

    return (
        <div className={wrapperClasses}>
            {onAddClick && (
                <Button size={"small"} shape={"cr-16"} icon={<PlusIcon/>} theme={"dark"} children={"add"}/>
            )}
            {onEditClick && (
                <Button size={"small"} shape={"cr-16"} icon={<EditIcon/>} theme={"dark"} children={"edit"}/>
            )}
            {onSortClick && (
                <Button size={"small"} shape={"cr-16"} icon={<SortIcon/>} theme={"dark"} children={"edit"}/>
            )}
        </div>
    );
};