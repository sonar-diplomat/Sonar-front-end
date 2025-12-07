import React, { useEffect } from 'react';
import styles from './Notification.module.css';

export interface NotificationProps {
  id: string;
  type: 'success' | 'error';
  message: string; // Показывается вместо statusCode
  errors?: string[]; // Показывается вместо message
  details?: string[]; // Показывается вместо message (если нет errors)
  duration?: number;
  onClose: (id: string) => void;
}

export const Notification: React.FC<NotificationProps> = ({
  id,
  type,
  message,
  errors,
  details,
  duration = 4000,
  onClose,
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(id);
    }, duration);

    return () => clearTimeout(timer);
  }, [id, duration, onClose]);

  // Используем errors, если есть, иначе details
  const displayText = errors && errors.length > 0 
    ? errors.join(', ')
    : details && details.length > 0
    ? details.join(', ')
    : undefined;

  // Truncate very long messages
  const truncatedDisplayText = displayText && displayText.length > 150 
    ? `${displayText.substring(0, 150)}...` 
    : displayText;

  const icon = type === 'success' ? '✓' : '✕';

  return (
    <div 
      className={`${styles.notification} ${styles[type]}`}
      role="alert"
      aria-live="polite"
    >
      <div className={styles.content}>
        <span className={styles.icon}>{icon}</span>
        <div className={styles.textContent}>
          {message && (
            <div className={styles.statusCode}>{message}</div>
          )}
          {truncatedDisplayText && (
            <div className={styles.message}>{truncatedDisplayText}</div>
          )}
        </div>
        <button
          className={styles.closeButton}
          onClick={() => onClose(id)}
          aria-label="Close notification"
        >
          ✕
        </button>
      </div>
    </div>
  );
};

