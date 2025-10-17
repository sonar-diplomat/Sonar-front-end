import React from 'react';
import styles from '../Input.module.css';

interface InputIconProps {
    icon: React.ReactNode;
    position: 'prefix' | 'suffix';
    clickable?: boolean;
    onClick?: () => void;
}

export const InputIcon: React.FC<InputIconProps> = ({
    icon,
    position,
    clickable = false,
    onClick
}) => {
    const className = clickable
        ? styles[`icon_${position}_button`]
        : styles[`icon_${position}`];

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if ((e.key === 'Enter' || e.key === ' ') && clickable) {
            e.preventDefault();
            onClick?.();
        }
    };

    if (clickable) {
        return (
            <button
                type="button"
                className={className}
                onClick={onClick}
                onKeyDown={handleKeyDown}
                tabIndex={-1}
            >
                {icon}
            </button>
        );
    }

    return <span className={className}>{icon}</span>;
};