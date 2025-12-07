import React, { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { NormalizedApiResponse } from '@shared/types';

export interface NotificationItem {
  id: string;
  type: 'success' | 'error';
  message: string; // Показывается вместо statusCode
  errors?: string[]; // Показывается вместо message
  details?: string[]; // Показывается вместо message (если нет errors)
  duration?: number;
}

interface NotificationContextType {
  notifications: NotificationItem[];
  addNotification: (notification: Omit<NotificationItem, 'id'>) => void;
  removeNotification: (id: string) => void;
  showSuccess: (message: string) => void;
  showError: (message: string, errorsOrDetails?: string[] | string) => void;
  showApiResponse: <T>(response: NormalizedApiResponse<T>) => void;
  clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

const generateId = () => `notification-${Date.now()}-${Math.random()}`;

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const addNotification = useCallback((notification: Omit<NotificationItem, 'id'>) => {
    const id = generateId();
    setNotifications((prev) => [...prev, { ...notification, id }]);
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const showSuccess = useCallback((message: string) => {
    const id = generateId();
    setNotifications((prev) => [
      ...prev,
      { id, type: 'success', message },
    ]);
  }, []);

  const showError = useCallback((message: string, errorsOrDetails?: string[] | string) => {
    const id = generateId();
    const errors = Array.isArray(errorsOrDetails) ? errorsOrDetails : errorsOrDetails ? [errorsOrDetails] : undefined;
    setNotifications((prev) => [
      ...prev,
      { id, type: 'error', message, errors },
    ]);
  }, []);

  const showApiResponse = useCallback(<T,>(response: NormalizedApiResponse<T>) => {
    const id = generateId();
    const message = response.message || (response.success ? 'Success' : 'An error occurred');
    const type = response.success ? 'success' : 'error';
    const errors = response.errors && response.errors.length > 0 ? response.errors : undefined;
    const details = !errors && response.details && response.details.length > 0 ? response.details : undefined;

    setNotifications((prev) => [
      ...prev,
      { id, type, message, errors, details },
    ]);
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  const value = {
    notifications,
    addNotification,
    removeNotification,
    showSuccess,
    showError,
    showApiResponse,
    clearAll,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotificationStore = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotificationStore must be used within NotificationProvider');
  }
  return context;
};

export const useNotifications = () => {
  const { addNotification, removeNotification, showSuccess, showError, showApiResponse, clearAll } = useNotificationStore();
  return { addNotification, removeNotification, showSuccess, showError, showApiResponse, clearAll };
};

