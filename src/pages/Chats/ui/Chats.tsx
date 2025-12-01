import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChatList } from '@widgets/ChatList';
import { useGetChatsQuery } from '@entities/Chat/api/rtkApi';
import type { Chat } from '@entities/Chat';
import styles from './Chats.module.css';

export const Chats: React.FC = () => {
    const navigate = useNavigate();
    const { data: chatsData, isLoading, error } = useGetChatsQuery();

    const handleChatClick = (chatId: number) => {
        navigate(`/chats/${chatId}`);
    };

    // Transform ChatListItemDTO to Chat & { lastMessage }
    const chats: (Chat & { lastMessage?: { textContent: string; createdAt?: string } })[] = React.useMemo(() => {
        if (!chatsData) return [];
        return chatsData.map((chat) => ({
            id: chat.id,
            name: chat.name,
            isGroup: chat.isGroup,
            coverId: chat.coverId,
            lastMessage: chat.lastMessage,
        }));
    }, [chatsData]);

    if (isLoading) {
        return (
            <div className={styles.container}>
                <div className={styles.loading}>
                    <div className={styles.loadingSpinner}></div>
                </div>
            </div>
        );
    }

    if (error || !chatsData) {
        return (
            <div className={styles.container}>
                <ChatList chats={[]} onChatClick={handleChatClick} emptyMessage="Failed to load chats" />
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <ChatList chats={chats} onChatClick={handleChatClick} />
        </div>
    );
};

