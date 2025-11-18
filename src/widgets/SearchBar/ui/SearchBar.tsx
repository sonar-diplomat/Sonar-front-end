import React from 'react';
import {Input, SearchIcon, ClearIcon} from '@shared/ui';
import type { SearchBarProps } from './SearchBar.types.ts';
import { useSearchValue } from '../hooks/useSearchValue.ts';

export type { SearchBarProps };

export const SearchBar: React.FC<SearchBarProps> = ({
    className = '',
    placeholder = 'Search',
    value,
    onChange,
    onSearch,
    showClearButton = true,
    onClear,
    ...props
}) => {
    const { currentValue, handleChange, clearValue, inputRef } = useSearchValue({
        value,
        onChange,
        onSearch,
    });

    const handleClear = () => {
        console.log("Clearing search value");
        clearValue();
        onClear?.();
    };

    const showClear = showClearButton && currentValue.length > 0;

    return (
        <Input
            ref={inputRef}
            className={className}
            placeholder={placeholder}
            value={currentValue}
            onChange={handleChange}
            type="search"
            icon={showClear ? <ClearIcon /> : <SearchIcon />}
            iconPosition="suffix"
            iconClickable={showClear}
            onIconClick={showClear ? handleClear : undefined}
            {...props}
        />
    );
};
