import React from 'react';
import styles from './Input.module.css';
import { useDropdown } from './hooks/useDropdown';
import { InputIcon } from './components/InputIcon';
import { InputDropdown } from './components/InputDropdown';
import { InputHelperText } from './components/InputHelperText';
import type { InputProps, DropdownOption } from './Input.types';

export type { InputProps, DropdownOption };

export const Input = React.forwardRef<HTMLInputElement, InputProps>(({
    label,
    helperText,
    error,
    iconPosition = 'prefix',
    icon,
    iconClickable = false,
    onIconClick,
    helperIcon,
    helperTextAction,
    dropdownText,
    dropdownOptions,
    onDropdownSelect,
    className = '',
    id,
    ...props
}, ref) => {
    const inputId = id || `input-${React.useId()}`;
    const dropdown = useDropdown();

    const hasHelperContent = helperText || error;
    const helperMessage = error || helperText;
    const showPrefixIcon = icon && iconPosition === 'prefix' && !dropdownText;
    const showSuffixIcon = icon && iconPosition === 'suffix' && !dropdownText;
    const showPrefixDropdown = dropdownText && dropdownOptions && iconPosition === 'prefix';
    const showSuffixDropdown = dropdownText && dropdownOptions && iconPosition === 'suffix';

    const handleOptionSelect = (option: DropdownOption) => {
        onDropdownSelect?.(option);
        dropdown.close();
    };

    return (
        <div className={`${styles.input_container} ${className}`}>
            {label && (
                <label htmlFor={inputId} className={styles.label}>
                    {label}
                </label>
            )}

            <div className={styles.input_wrapper} ref={dropdown.ref}>
                {showPrefixDropdown && (
                    <InputDropdown
                        text={dropdownText}
                        options={dropdownOptions}
                        position="prefix"
                        isOpen={dropdown.isOpen}
                        onToggle={dropdown.toggle}
                        onSelect={handleOptionSelect}
                    />
                )}

                {showPrefixIcon && (
                    <InputIcon
                        icon={icon}
                        position="prefix"
                        clickable={iconClickable}
                        onClick={onIconClick}
                    />
                )}

                <input
                    ref={ref}
                    id={inputId}
                    className={`${styles.input} ${error ? styles.error : ''}`}
                    aria-invalid={error ? 'true' : 'false'}
                    aria-describedby={hasHelperContent ? `${inputId}-helper` : undefined}
                    {...props}
                />

                {showSuffixIcon && (
                    <InputIcon
                        icon={icon}
                        position="suffix"
                        clickable={iconClickable}
                        onClick={onIconClick}
                    />
                )}

                {showSuffixDropdown && (
                    <InputDropdown
                        text={dropdownText}
                        options={dropdownOptions}
                        position="suffix"
                        isOpen={dropdown.isOpen}
                        onToggle={dropdown.toggle}
                        onSelect={handleOptionSelect}
                    />
                )}
            </div>

            {hasHelperContent && (
                <InputHelperText
                    text={helperMessage || ''}
                    icon={helperIcon}
                    action={helperTextAction}
                    isError={!!error}
                    inputId={inputId}
                />
            )}
        </div>
    );
});

Input.displayName = 'Input';