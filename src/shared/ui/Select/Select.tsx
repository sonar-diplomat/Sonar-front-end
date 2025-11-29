import React, { useState, useRef, useEffect } from 'react';
import styles from './Select.module.css';
import { DropDown } from '../icons';

export interface SelectOption {
  value: number;
  label: string;
}

export interface SelectProps {
  label?: string;
  options: SelectOption[];
  value?: string | number;
  onChange: (value: string | number) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  className?: string;
}

export const Select: React.FC<SelectProps> = ({
  label,
  options,
  value,
  onChange,
  placeholder = 'Select an option',
  disabled = false,
  error,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(opt => opt.value == value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  const handleSelect = (optionValue: string | number) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div className={`${styles.container} ${className}`} ref={containerRef}>
      {label && <label className={styles.label}>{label}</label>}
      <div className={styles.selectWrapper}>
        <button
          type="button"
          className={`${styles.select} ${error ? styles.error : ''} ${disabled ? styles.disabled : ''}`}
          onClick={handleToggle}
          onKeyDown={handleKeyDown}
          disabled={disabled}
        >
          <span className={styles.selectedValue}>
            {selectedOption?.label || placeholder}
          </span>
          <span className={`${styles.arrow} ${isOpen ? styles.open : ''}`}>
            <DropDown />
          </span>
        </button>
        {isOpen && (
          <div className={styles.dropdown}>
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                className={`${styles.option} ${option.value == value ? styles.selected : ''}`}
                onClick={() => handleSelect(option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}
      </div>
      {error && <span className={styles.errorText}>{error}</span>}
    </div>
  );
};

