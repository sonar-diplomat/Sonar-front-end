import React from 'react';

export interface DropdownOption {
    value: string;
    label: string;
}

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    helperText?: string;
    error?: string;
    iconPosition?: 'prefix' | 'suffix';
    icon?: React.ReactNode;
    iconClickable?: boolean;
    onIconClick?: () => void;
    helperIcon?: React.ReactNode;
    helperTextAction?: {
        text: string;
        onClick: () => void;
    };
    dropdownText?: string;
    dropdownOptions?: DropdownOption[];
    onDropdownSelect?: (option: DropdownOption) => void;
}