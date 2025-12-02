import React from 'react';
import type { Chat } from '@entities/Chat';
import { ChatListItem } from './ChatListItem';
import styles from './ChatList.module.css';

export interface ChatListProps {
    chats: (Chat & { lastMessage?: { textContent: string; createdAt?: string } })[];
    onChatClick?: (chatId: number) => void;
    emptyMessage?: string;
}

export const ChatList: React.FC<ChatListProps> = ({
    chats,
    onChatClick,
    emptyMessage = 'No chats yet',
}) => {
    if (chats.length === 0) {
        return (
            <div className={styles.empty}>
                <div className={styles.emptyText}>{emptyMessage}</div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            {chats.map((chat) => (
                <ChatListItem key={chat.id} chat={chat} onClick={onChatClick} />
            ))}
        </div>
    );
};

