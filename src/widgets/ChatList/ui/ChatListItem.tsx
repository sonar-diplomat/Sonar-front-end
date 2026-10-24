import React from 'react';

import type { Chat } from '@entities/Chat';
import { formatChatDate } from '@shared/lib/date-utils';
import { LoadingImage } from '@shared/ui';

import styles from './ChatListItem.module.css';

export interface ChatListItemProps {
    chat: Chat & {
        lastMessage?: { textContent: string; createdAt?: string };

    };
    onClick?: (chatId: number) => void;
}

export const ChatListItem: React.FC<ChatListItemProps> = ({ chat, onClick }) => {
    const handleClick = () => {
        onClick?.(chat.id);
    };

    const lastMessageDate = chat.lastMessage?.createdAt
        ? formatChatDate(chat.lastMessage.createdAt)
        : null;

    return (
        <button type="button" className={styles.container} onClick={handleClick} aria-label={`Open chat: ${chat.name}`}>
            <div className={styles.avatar}>
                {chat.cover ? (
                    <LoadingImage src={(chat.cover as { url?: string }).url || ''} alt={chat.name} className={styles.avatarImage} />
                ) : (
                    <div className={styles.avatarPlaceholder}>
                        {chat.name.charAt(0).toUpperCase()}
                    </div>
                )}
            </div>
            <div className={styles.content}>
                <div className={styles.header}>
                    <div className={styles.name}>{chat.name}</div>
                    {lastMessageDate && <div className={styles.date}>{lastMessageDate}</div>}
                </div>
                {chat.lastMessage && (
                    <div className={styles.lastMessage}>{chat.lastMessage.textContent}</div>
                )}
            </div>
        </button>
    );
};
