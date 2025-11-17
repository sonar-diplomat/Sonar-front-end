import type React from 'react';

export interface SearchBarProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
    /**
     * Optional className for custom styling
     */
    className?: string;

    /**
     * Callback when the search value changes
     */
    onSearch?: (value: string) => void;

    /**
     * Show clear button when input has value
     * @default true
     */
    showClearButton?: boolean;

    /**
     * Callback when clear button is clicked
     */
    onClear?: () => void;
}
