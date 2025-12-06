import React from 'react';
import styles from './LoadingPlaceholder.module.css';

export type LoadingPlaceholderVariant = 'spinner' | 'skeleton';
export type LoadingPlaceholderSize = 'small' | 'medium' | 'large';

export interface LoadingPlaceholderProps {
  variant?: LoadingPlaceholderVariant;
  text?: string;
  className?: string;
  size?: LoadingPlaceholderSize;
  fullWidth?: boolean;
  style?: React.CSSProperties;
}

export const LoadingPlaceholder: React.FC<LoadingPlaceholderProps> = ({
  variant = 'spinner',
  text,
  className = '',
  size = 'medium',
  fullWidth = false,
  style,
}) => {
  if (variant === 'skeleton') {
    return (
      <div 
        className={`${styles.skeleton} ${styles[size]} ${fullWidth ? styles.fullWidth : ''} ${className}`}
        style={style}
      >
        <div className={styles.skeletonShimmer}></div>
      </div>
    );
  }

  return (
    <div 
      className={`${styles.spinnerContainer} ${fullWidth ? styles.fullWidth : ''} ${className}`}
      style={style}
    >
      <div className={styles.spinner}></div>
      {text && <p className={styles.text}>{text}</p>}
    </div>
  );
};

