import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Message } from '@widgets/Message';
import { SendInput } from '@widgets/SendInput';
import type { Message as MessageType } from '@entities/Chat/model/types/Message';
import { getChatMockData } from '@entities/Chat/model/mock/chatMockData';
import styles from './Chat.module.css';

export const Chat: React.FC = () => {
    const { chatId } = useParams<{ chatId: string }>();
    const navigate = useNavigate();
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [currentUserId] = useState(1);
    const [replyMessage, setReplyMessage] = useState<MessageType | null>(null);

    const chatData = useMemo(() => {
        const id = Number(chatId);
        return getChatMockData(id);
    }, [chatId]);

    const messages = chatData?.messages || [];
    const isGroupChat = chatData?.chat.isGroup || false;

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = (text: string) => {
        console.log('Sending message:', text, replyMessage ? `(reply to ${replyMessage.id})` : '');
        setReplyMessage(null);
    };

    const handleReply = (messageId: number) => {
        const message = messages.find(m => m.id === messageId);
        if (message) {
            setReplyMessage(message);
        }
    };

    const handleCancelReply = () => {
        setReplyMessage(null);
    };

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
    };

    const handleEdit = (messageId: number) => {
        console.log('Edit message:', messageId);
    };

    const handleDelete = (messageId: number) => {
        console.log('Delete message:', messageId);
    };

    const handleReport = (messageId: number) => {
        navigate(`/report?messageId=${messageId}`);
    };

    const handleAttach = () => {
        console.log('Attach file');
    };

    return (
        <div className={styles.container}>
            <div className={styles.messages}>
                {messages.map((message) => (
                    <Message
                        key={message.id}
                        message={message}
                        isOwn={message.senderId === currentUserId}
                        currentUserId={currentUserId}
                        senderName={message.senderId !== currentUserId && isGroupChat ? message.senderName : undefined}
                        senderAvatar={message.senderId !== currentUserId ? undefined : undefined}
                        isGroupChat={isGroupChat}
                        onReply={handleReply}
                        onCopy={handleCopy}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        onReport={handleReport}
                    />
                ))}
                <div ref={messagesEndRef} />
            </div>
            <SendInput 
                onSend={handleSend} 
                onAttach={handleAttach}
                replyMessage={replyMessage}
                onCancelReply={handleCancelReply}
            />
        </div>
    );
};

