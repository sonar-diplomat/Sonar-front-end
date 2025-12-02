import React from 'react';
import styles from './SettingsItem.module.css';
import { RightArrow } from '@shared/ui';

export interface SettingsItemProps {
  label: string;
  description?: string;
  onClick?: () => void;
  rightContent?: React.ReactNode;
  showArrow?: boolean;
  disabled?: boolean;
  className?: string;
}

export const SettingsItem: React.FC<SettingsItemProps> = ({
  label,
  description,
  onClick,
  rightContent,
  showArrow = true,
  disabled = false,
  className = '',
}) => {
  const isClickable = !!onClick && !disabled;

  const content = (
    <>
      <div className={styles.content}>
        <div className={styles.textContent}>
          <span className={styles.label}>{label}</span>
          {description && <span className={styles.description}>{description}</span>}
        </div>
        {rightContent && <div className={styles.rightContent}>{rightContent}</div>}
      </div>
      {showArrow && isClickable && (
        <div className={styles.arrow}>
          <RightArrow />
        </div>
      )}
    </>
  );

  if (isClickable) {
    return (
      <button
        className={`${styles.item} ${styles.clickable} ${className}`}
        onClick={onClick}
        disabled={disabled}
      >
        {content}
      </button>
    );
  }

  return <div className={`${styles.item} ${className}`}>{content}</div>;
};

