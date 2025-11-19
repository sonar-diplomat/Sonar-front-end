import React from 'react';
import styles from '../Input.module.css';
import type { DropdownOption } from '../Input.types';
import {DropDown} from "@shared/ui/icons.tsx";

interface InputDropdownProps {
    text: string;
    options: DropdownOption[];
    position: 'prefix' | 'suffix';
    isOpen: boolean;
    onToggle: () => void;
    onSelect: (option: DropdownOption) => void;
}

export const InputDropdown: React.FC<InputDropdownProps> = ({
    text,
    options,
    position,
    isOpen,
    onToggle,
    onSelect
}) => {
    const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            if (options.length > 0) {
                onToggle();
            }
        }
    };

    const handleOptionSelect = (option: DropdownOption) => {
        onSelect(option);
    };

    const dropdownClassName = styles[`dropdown_${position}`];
    const menuClassName = `${styles.dropdown_menu} ${styles[`dropdown_menu_${position}`]}`;

    return (
        <>
            <button
                type="button"
                className={dropdownClassName}
                onClick={onToggle}
                onKeyDown={handleKeyDown}
                tabIndex={-1}
            >
                {text}
                <DropDown/>
            </button>
            {isOpen && options.length > 0 && (
                <div className={menuClassName}>
                    {options.map((option) => (
                        <button
                            key={option.value}
                            type="button"
                            className={styles.dropdown_option}
                            onClick={() => handleOptionSelect(option)}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>
            )}
        </>
    );
};