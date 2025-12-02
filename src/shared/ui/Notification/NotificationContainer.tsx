import React from 'react';
import { Notification, type NotificationProps } from '@shared/ui';
import styles from './NotificationContainer.module.css';

interface NotificationItem extends Omit<NotificationProps, 'onClose'> {}

interface NotificationContainerProps {
  notifications: NotificationItem[];
  onClose: (id: string) => void;
}

export const NotificationContainer: React.FC<NotificationContainerProps> = ({
  notifications,
  onClose,
}) => {
  if (notifications.length === 0) return null;

  return (
    <div className={styles.container}>
      {notifications.map((notification) => (
        <Notification
          key={notification.id}
          {...notification}
          onClose={onClose}
        />
      ))}
    </div>
  );
};

