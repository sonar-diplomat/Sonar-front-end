import React from 'react';

import type { SearchBarProps } from './SearchBar.types';
import styles from './SearchBar.module.css';

export type { SearchBarProps };

const SearchIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg
        className={className}
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
    >
        <path
            d="M9 17C13.4183 17 17 13.4183 17 9C17 4.58172 13.4183 1 9 1C4.58172 1 1 4.58172 1 9C1 13.4183 4.58172 17 9 17Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <path
            d="M19 19L14.65 14.65"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
);

const ClearIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg
        className={className}
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
    >
        <path
            d="M12 4L4 12M4 4L12 12"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
);

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
    const [internalValue, setInternalValue] = React.useState('');
    const inputRef = React.useRef<HTMLInputElement>(null);

    const currentValue = value !== undefined ? value : internalValue;
    const isControlled = value !== undefined;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;

        if (!isControlled) {
            setInternalValue(newValue);
        }

        onChange?.(e);
        onSearch?.(newValue);
    };

    const handleClear = () => {
        if (!isControlled) {
            setInternalValue('');
        }

        onClear?.();
        onSearch?.('');

        // Focus the input after clearing
        inputRef.current?.focus();
    };

    const showClear = showClearButton && currentValue.length > 0;

    return (
        <div className={`${styles.search_container} ${className}`}>
            <div className={styles.search_wrapper}>
                <SearchIcon className={styles.search_icon} />
                <input
                    ref={inputRef}
                    type="search"
                    className={styles.search_input}
                    placeholder={placeholder}
                    value={currentValue}
                    onChange={handleChange}
                    {...props}
                />
                {showClear && (
                    <button
                        type="button"
                        className={styles.clear_button}
                        onClick={handleClear}
                        aria-label="Clear search"
                    >
                        <ClearIcon />
                    </button>
                )}
            </div>
        </div>
    );
};
