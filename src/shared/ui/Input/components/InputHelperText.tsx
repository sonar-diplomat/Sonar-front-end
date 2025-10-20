import React from 'react';
import styles from '../Input.module.css';

interface InputHelperTextProps {
    text: string;
    icon?: React.ReactNode;
    action?: {
        text: string;
        onClick: () => void;
    };
    isError?: boolean;
    inputId: string;
}

export const InputHelperText: React.FC<InputHelperTextProps> = ({
    text,
    icon,
    action,
    isError = false,
    inputId
}) => {
    const handleActionClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();
        action?.onClick();
    };

    const handleActionKeyDown = (e: React.KeyboardEvent<HTMLAnchorElement>) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            action?.onClick();
        }
    };

    return (
        <span
            id={`${inputId}-helper`}
            className={`${styles.helper_text} ${isError ? styles.error_text : ''}`}
        >
            {icon && <span className={styles.helper_icon}>{icon}</span>}
            {text}
            {action && !isError && (
                <a
                    className={styles.helper_action}
                    onClick={handleActionClick}
                    onKeyDown={handleActionKeyDown}
                    role="button"
                    tabIndex={0}
                >
                    {action.text}
                </a>
            )}
        </span>
    );
};