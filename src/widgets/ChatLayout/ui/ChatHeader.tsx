import React from 'react';
import { Button, LeftArrow, PlusIcon, MoreIcon } from '@shared/ui';
import styles from './ChatHeader.module.css';

export interface ChatHeaderProps {
    title: string;
    subtitle?: string;
    onBack?: () => void;
    onAction?: () => void;
    actionIcon?: 'plus' | 'more';
    showSeparator?: boolean;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
    title,
    subtitle,
    onBack,
    onAction,
    actionIcon = 'plus',
    showSeparator = true,
}) => {
    const icon = actionIcon === 'plus' ? <PlusIcon /> : <MoreIcon />;

    return (
        <>
            <div className={styles.container}>
                <Button
                    iconOnly
                    icon={<LeftArrow />}
                    onClick={onBack}
                    variant="text"
                    theme="dark"
                    size="medium"
                    className={styles.button}
                />
                <div className={styles.content}>
                    <div className={styles.title}>{title}</div>
                    {subtitle && <div className={styles.subtitle}>{subtitle}</div>}
                </div>
                {onAction && (
                    <Button
                        iconOnly
                        icon={icon}
                        onClick={onAction}
                        variant="text"
                        theme="dark"
                        size="medium"
                        className={styles.button}
                    />
                )}
            </div>
            {showSeparator && <div className={styles.separator} />}
        </>
    );
};

