import React from 'react';
import styles from './WidgetErrorState.module.css';
import { AlertTriangleIcon } from '../icons';

interface WidgetErrorStateProps {
    title: string;
    message?: string;
    icon?: React.ReactNode;
    onRetry?: () => void;
    className?: string;
}

export const WidgetErrorState: React.FC<WidgetErrorStateProps> = ({
    title,
    message = 'Something went wrong',
    icon,
    onRetry,
    className = '',
}) => {
    return (
        <div className={`${styles.container} ${className}`}>
            <div className={styles.iconContainer}>
                {icon || <AlertTriangleIcon className={styles.defaultIcon} />}
            </div>
            <h4 className={styles.title}>{title}</h4>
            {message && <p className={styles.message}>{message}</p>}
            {onRetry && (
                <button className={styles.retryButton} onClick={onRetry}>
                    Try again
                </button>
            )}
        </div>
    );
};

