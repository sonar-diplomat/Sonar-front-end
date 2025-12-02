import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChatList } from '@widgets/ChatList';
import type { Chat } from '@entities/Chat';
import styles from './Chats.module.css';

export const Chats: React.FC = () => {
    const navigate = useNavigate();

    const [chats] = React.useState<(Chat & { lastMessage?: { textContent: string; createdAt?: string } })[]>([
        {
            id: 1,
            name: 'John Doe',
            isGroup: false,
            coverId: 1,
            lastMessage: {
                textContent: 'Hello! How are you?',
                createdAt: new Date().toISOString(),
            },
        },
        {
            id: 2,
            name: 'Team Chat',
            isGroup: true,
            coverId: 2,
            lastMessage: {
                textContent: 'Meeting at 3 PM',
                createdAt: new Date(Date.now() - 86400000).toISOString(),
            },
        },
    ]);

    const handleChatClick = (chatId: number) => {
        navigate(`/chats/${chatId}`);
    };

    return (
        <div className={styles.container}>
            <ChatList chats={chats} onChatClick={handleChatClick} />
        </div>
    );
};

