import type React from 'react';

export interface SearchBarProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'value'> {
    className?: string;
    value?: string;
    onSearch?: (value: string) => void;
    showClearButton?: boolean;
    onClear?: () => void;
}
