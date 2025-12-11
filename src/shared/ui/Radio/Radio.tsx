import React, { useCallback } from 'react';
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
  const handleChange = useCallback(() => {
    if (!disabled) {
      // For radio buttons, when clicked, checked is always true
      onChange(true);
    }
  }, [disabled, onChange]);

  return (
    <label 
      className={`${styles.radioLabel} ${disabled ? styles.disabled : ''}`}
    >
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

