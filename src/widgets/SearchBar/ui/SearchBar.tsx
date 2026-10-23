import React,{ useMemo } from 'react';

import { ClearIcon,Input,SearchIcon } from '@shared/ui';

import { useSearchValue } from '../hooks/useSearchValue.ts';

import type { SearchBarProps } from './SearchBar.types.ts';

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
        clearValue();
        onClear?.();
    };

    const showClear = showClearButton && currentValue.length > 0;
    const iconNode = useMemo(() => {
        if (showClear) return <ClearIcon />;
        return <SearchIcon />;
    }, [showClear]);

    return (
        <Input
            ref={inputRef}
            className={className}
            placeholder={placeholder}
            value={currentValue}
            onChange={handleChange}
            type="text"
            icon={iconNode}
            iconPosition="suffix"
            iconLabel="Clear search" iconClickable={showClear}
            onIconClick={showClear ? handleClear : undefined}
            {...props}
        />
    );
};
