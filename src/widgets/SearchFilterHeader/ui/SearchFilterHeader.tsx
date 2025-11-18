import React from 'react';
import {ChipsBar, type Category} from "@widgets/ChipsBar";

import styles from './SearchFilterHeader.module.css';
import {SearchBar} from "@widgets/SearchBar";

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
        <div className={styles.header}>
            <div className={styles.title}>
                {title}
            </div>
            <SearchBar placeholder={searchPlaceholder}/>
            <ChipsBar
                selectedCategory={selectedCategory}
                onCategoryChange={onCategoryChange}
            />
        </div>
    );
};
