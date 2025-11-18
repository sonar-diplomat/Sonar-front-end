import React from 'react';
import styles from './Button.module.css';

export type ButtonVariant = 'light' | 'dark';
export type ButtonSize = 'small' | 'medium' | 'large';
export type ButtonShape = 'cr-16' | 'cr-20' | 'cr-24' | 'cr-32';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  shape?: ButtonShape;
  iconOnly?: boolean;
  icon?: React.ReactNode;
  children?: React.ReactNode;
  fullWidth?: boolean;
  disabled?: boolean;
  loading?: boolean;
  selected?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'light',
  size = 'medium',
  shape = 'cr-20',
  iconOnly = false,
  icon,
  children,
  fullWidth = false,
  disabled = false,
  loading = false,
  selected = false,
  className = '',
  ...props
}) => {
  const classNames = [
    styles.button,
    styles[variant],
    styles[size],
    styles[shape],
    iconOnly && styles.iconOnly,
    fullWidth && styles.fullWidth,
    disabled && styles.disabled,
    loading && styles.loading,
    selected && styles.selected,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      className={classNames}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className={styles.spinner} />
      ) : (
        <>
          {icon && <span className={styles.icon}>{icon}</span>}
          {!iconOnly && children && <span className={styles.text}>{children}</span>}
        </>
      )}
    </button>
  );
};