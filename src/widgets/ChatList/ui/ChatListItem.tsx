import React from 'react';
import type { Chat } from '@entities/Chat';
import type { ImageFile } from '@entities/User';
import { formatChatDate } from '@shared/lib/date-utils';
import { LoadingImage } from '@shared/ui';
import styles from './ChatListItem.module.css';

export interface ChatListItemProps {
    chat: Chat & { 
        lastMessage?: { textContent: string; createdAt?: string };
        cover?: ImageFile;
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
        <div className={styles.container} onClick={handleClick}>
            <div className={styles.avatar}>
                {chat.cover ? (
                    <LoadingImage src={chat.cover.url || ''} alt={chat.name} className={styles.avatarImage} />
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
        </div>
    );
};

