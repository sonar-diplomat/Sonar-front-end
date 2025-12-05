import React, { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { NormalizedApiResponse } from '@shared/types';

export interface NotificationItem {
  id: string;
  type: 'success' | 'error';
  message: string;
  statusCode?: number;
  duration?: number;
}

interface NotificationContextType {
  notifications: NotificationItem[];
  addNotification: (notification: Omit<NotificationItem, 'id'>) => void;
  removeNotification: (id: string) => void;
  showSuccess: (message: string, statusCode?: number) => void;
  showError: (message: string, statusCode?: number) => void;
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

  const showSuccess = useCallback((message: string, statusCode?: number) => {
    const id = generateId();
    setNotifications((prev) => [
      ...prev,
      { id, type: 'success', message, statusCode },
    ]);
  }, []);

  const showError = useCallback((message: string, statusCode?: number) => {
    const id = generateId();
    setNotifications((prev) => [
      ...prev,
      { id, type: 'error', message, statusCode },
    ]);
  }, []);

  const showApiResponse = useCallback(<T,>(response: NormalizedApiResponse<T>) => {
    const id = generateId();
    const message = response.message || (response.success ? 'Success' : 'An error occurred');
    const type = response.success ? 'success' : 'error';

    setNotifications((prev) => [
      ...prev,
      { id, type, message, statusCode: response.status },
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

