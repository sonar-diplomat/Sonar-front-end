import React, { useState } from 'react';

import {Button} from "@shared/ui";

import styles from './ChipsBar.module.css';

import type {ChipsBarProps, Category} from './ChipsBar.types';

const defaultCategories: Category[] = ['All', 'Creators', 'Playlists', 'Radio'];

export const ChipsBar: React.FC<ChipsBarProps> = ({
    selectedCategory: controlledCategory,
    onCategoryChange,
    categories = defaultCategories,
    className = ''
}) => {
    const [internalCategory, setInternalCategory] = useState<Category>('All');

    const selectedCategory = controlledCategory ?? internalCategory;

    const handleCategoryClick = (category: Category) => {
        if (onCategoryChange) {
            onCategoryChange(category);
        } else {
            setInternalCategory(category);
        }
    };

    const containerClasses = [styles.container, className].filter(Boolean).join(' ');

    return (
        <div className={containerClasses}>
            {categories.map((category) => (
                <Button
                    key={category}
                    size="small"
                    shape="cr-16"
                    variant="filled"
                    theme={selectedCategory === category ? 'light' : 'dark'}
                    selected={selectedCategory === category}
                    onClick={() => handleCategoryClick(category)}
                >
                    {category}
                </Button>
            ))}
        </div>
    );
};
