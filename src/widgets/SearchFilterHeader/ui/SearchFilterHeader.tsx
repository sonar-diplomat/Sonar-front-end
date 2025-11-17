import React from 'react';

import {Input, SearchIcon} from "@shared/ui";
import {ChipsBar, type Category} from "@widgets/ChipsBar";

import styles from './SearchFilterHeader.module.css';

interface SearchFilterHeaderProps {
    title: string;
    selectedCategory: Category;
    onCategoryChange: (category: Category) => void;
    searchPlaceholder?: string;
}

export const SearchFilterHeader: React.FC<SearchFilterHeaderProps> = ({
    title,
    selectedCategory,
    onCategoryChange,
    searchPlaceholder = "Search in library"
}) => {
    return (
        <>
            <div className={styles.title}>
                {title}
            </div>
            <div className={styles.searchWrapper}>
                <Input
                    type="text"
                    placeholder={searchPlaceholder}
                    icon={<SearchIcon/>}
                    iconPosition="suffix"
                />
            </div>
            <ChipsBar
                selectedCategory={selectedCategory}
                onCategoryChange={onCategoryChange}
            />
        </>
    );
};
