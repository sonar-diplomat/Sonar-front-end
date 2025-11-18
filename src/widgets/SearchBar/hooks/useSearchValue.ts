import React from 'react';

interface UseSearchValueProps {
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onSearch?: (value: string) => void;
}

export const useSearchValue = ({ value, onChange, onSearch }: UseSearchValueProps) => {
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

    const clearValue = () => {
        if (!isControlled) {
            setInternalValue('');
        }

        onSearch?.('');
        inputRef.current?.focus();
    };

    return {
        currentValue,
        handleChange,
        clearValue,
        inputRef,
    };
};