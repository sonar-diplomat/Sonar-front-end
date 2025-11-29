import React, { useMemo } from 'react';
import { Outlet, useLocation, useNavigate, useParams } from 'react-router-dom';
import { ChatHeader } from './ChatHeader';
import { getChatMockData } from '@entities/Chat/model/mock/chatMockData';
import styles from './ChatLayout.module.css';

export const ChatLayout: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const params = useParams<{ chatId?: string }>();

    const isChatList = location.pathname === '/chats';
    const isChatDetail = !!params.chatId;

    const chatData = useMemo(() => {
        if (!isChatDetail || !params.chatId) return null;
        return getChatMockData(Number(params.chatId));
    }, [isChatDetail, params.chatId]);

    const handleBack = () => {
        if (isChatDetail) {
            navigate('/chats');
        } else {
            navigate(-1);
        }
    };

    const handleAction = () => {
        if (isChatList) {
            console.log('Create new chat');
        } else if (isChatDetail && params.chatId) {
            navigate(`/chats/${params.chatId}/info`);
        }
    };

    const getTitle = () => {
        if (isChatList) {
            return 'Inbox';
        }
        if (isChatDetail && chatData) {
            return chatData.chat.name;
        }
        return 'Chat';
    };

    const getSubtitle = () => {
        if (isChatDetail && !chatData?.chat.isGroup) {
            return 'Last seen recently';
        }
        return undefined;
    };

    const getActionIcon = (): 'plus' | 'more' => {
        if (isChatList) {
            return 'plus';
        }
        return 'more';
    };

    return (
        <div className={styles.layout}>
            <div className={styles.headerContainer}>
                <ChatHeader
                    title={getTitle()}
                    subtitle={getSubtitle()}
                    onBack={handleBack}
                    onAction={handleAction}
                    actionIcon={getActionIcon()}
                    showSeparator={false}
                />
            </div>
            <div className={styles.content}>
                <Outlet />
            </div>
        </div>
    );
};

