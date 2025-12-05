import React from 'react';
import {ChipsBar, type Category} from "@widgets/ChipsBar";

import styles from './SearchFilterHeader.module.css';
import {SearchBar} from "@widgets/SearchBar";

interface SearchFilterHeaderProps {
    title: string;
    selectedCategory: Category;
    onCategoryChange: (category: Category) => void;
    searchPlaceholder?: string;
    searchValue?: string;
    onSearch?: (value: string) => void;
}

export const SearchFilterHeader: React.FC<SearchFilterHeaderProps> = ({
    title,
    selectedCategory,
    onCategoryChange,
    searchPlaceholder = "Search in library",
    searchValue,
    onSearch,
}) => {
    return (
        <div className={styles.header}>
            <div className={styles.title}>
                {title}
            </div>
            <SearchBar 
                placeholder={searchPlaceholder}
                value={searchValue}
                onSearch={onSearch}
            />
            <ChipsBar
                selectedCategory={selectedCategory}
                onCategoryChange={onCategoryChange}
            />
        </div>
    );
};
