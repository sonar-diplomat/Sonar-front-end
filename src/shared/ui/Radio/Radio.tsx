import React from 'react';
import styles from './Radio.module.css';

export interface RadioProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  value?: string | number;
  name?: string;
  disabled?: boolean;
}

export const Radio: React.FC<RadioProps> = ({
  label,
  checked,
  onChange,
  value,
  name,
  disabled = false,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!disabled) {
      onChange(e.target.checked);
    }
  };

  return (
    <label className={`${styles.radioLabel} ${disabled ? styles.disabled : ''}`}>
      <input
        type="radio"
        checked={checked}
        onChange={handleChange}
        value={value}
        name={name}
        disabled={disabled}
        className={styles.radioInput}
      />
      <span className={styles.radioText}>{label}</span>
    </label>
  );
};

