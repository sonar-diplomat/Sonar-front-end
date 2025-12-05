import React, { useEffect } from 'react';
import styles from './Notification.module.css';

export interface NotificationProps {
  id: string;
  type: 'success' | 'error';
  message: string;
  statusCode?: number;
  duration?: number;
  onClose: (id: string) => void;
}

export const Notification: React.FC<NotificationProps> = ({
  id,
  type,
  message,
  statusCode,
  duration = 4000,
  onClose,
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(id);
    }, duration);

    return () => clearTimeout(timer);
  }, [id, duration, onClose]);

  // Truncate very long messages
  const truncatedMessage = message.length > 150 
    ? `${message.substring(0, 150)}...` 
    : message;

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
          {statusCode && (
            <div className={styles.statusCode}>Status: {statusCode}</div>
          )}
          <div className={styles.message}>{truncatedMessage}</div>
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

