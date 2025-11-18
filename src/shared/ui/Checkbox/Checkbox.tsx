import React from 'react';

import { CheckMark } from '../icons';

import styles from './Checkbox.module.css';


export interface CheckboxProps {
  label?: string | React.ReactNode;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
}

export const Checkbox: React.FC<CheckboxProps> = ({
  label,
  checked = false,
  onChange,
  disabled = false,
  className,
}) => {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (onChange) {
      onChange(event.target.checked);
    }
  };

  return (
    <label className={`${styles.container} ${disabled ? styles.disabled : ''} ${className || ''}`}>
      <input
        type="checkbox"
        checked={checked}
        onChange={handleChange}
        disabled={disabled}
        className={styles.input}
      />
      <span className={styles.checkmark}>
        {checked && <CheckMark className={styles.icon} />}
      </span>
      {label && <span className={styles.label}>{label}</span>}
    </label>
  );
};
