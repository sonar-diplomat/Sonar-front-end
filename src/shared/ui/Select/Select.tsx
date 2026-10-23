import React,{ useEffect,useId,useRef,useState } from 'react';

import { DropDown } from '../icons';

import styles from './Select.module.css';

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
  const [activeIndex, setActiveIndex] = useState(0);
  const selectId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const optionRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const selectedOption = options.find(opt => opt.value == value);

  useEffect(() => {
    if (isOpen) optionRefs.current[activeIndex]?.focus();
  }, [isOpen, activeIndex]);

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
      setActiveIndex(Math.max(0, options.findIndex(option => option.value == value)));
      setIsOpen(!isOpen);
    }
  };

  const handleSelect = (optionValue: string | number) => {
    onChange(optionValue);
    setIsOpen(false);
    triggerRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape' && isOpen) {
      e.preventDefault();
      e.stopPropagation();
      setIsOpen(false);
      triggerRef.current?.focus();
      return;
    }
    if (!options.length || !['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(e.key)) return;
    e.preventDefault();
    let next = isOpen ? activeIndex : Math.max(0, options.findIndex(option => option.value == value));
    if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = options.length - 1;
    else if (isOpen) next = (next + (e.key === 'ArrowDown' ? 1 : -1) + options.length) % options.length;
    setActiveIndex(next);
    setIsOpen(true);
  };

  return (
    <div className={`${styles.container} ${className}`} ref={containerRef} onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) setIsOpen(false); }}>
      {label && <label id={`${selectId}-label`} className={styles.label}>{label}</label>}
      <div className={styles.selectWrapper}>
        <button
          type="button"
          ref={triggerRef}
          aria-labelledby={label ? `${selectId}-label` : undefined}
          aria-describedby={`${selectId}-value`}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-controls={isOpen ? `${selectId}-options` : undefined}
          className={`${styles.select} ${error ? styles.error : ''} ${disabled ? styles.disabled : ''}`}
          onClick={handleToggle}
          onKeyDown={handleKeyDown}
          disabled={disabled}
        >
          <span id={`${selectId}-value`} className={styles.selectedValue}>
            {selectedOption?.label || placeholder}
          </span>
          <span className={`${styles.arrow} ${isOpen ? styles.open : ''}`}>
            <DropDown />
          </span>
        </button>
        {isOpen && (
          <div id={`${selectId}-options`} className={styles.dropdown} role="listbox" aria-label={label || 'Options'} onKeyDown={handleKeyDown}>
            {options.map((option, index) => (
              <button
                key={option.value}
                ref={element => { optionRefs.current[index] = element; }}
                type="button"
                role="option"
                aria-selected={option.value == value}
                tabIndex={index === activeIndex ? 0 : -1}
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

