import React, { useState } from 'react';
import { Outlet, useLocation, useNavigate, useParams } from 'react-router-dom';
import { ChatHeader } from './ChatHeader';
import { CreateGroupChatModal } from '@widgets/CreateGroupChatModal';
import { chatApi } from '@entities/Chat/api/rtkApi';
import { useAppSelector } from '@shared/store/hooks';
import styles from './ChatLayout.module.css';

export const ChatLayout: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const params = useParams<{ chatId?: string }>();
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    const isChatList = location.pathname === '/chats';
    const isChatDetail = !!params.chatId;
    const isUserInfo = location.pathname.includes('/info');

    const chatIdNumber = params.chatId ? Number(params.chatId) : 0;
    
    const chatsList = useAppSelector((state) => 
        chatApi.endpoints.getChats.select()(state).data
    );
    
    const chatInfo = chatsList?.find(chat => chat.id === chatIdNumber);

    const handleBack = () => {
        if (isUserInfo && params.chatId) {
            navigate(`/chats/${params.chatId}`);
        } else if (isChatDetail) {
            navigate('/chats');
        } else {
            navigate(-1);
        }
    };

    const handleAction = () => {
        if (isChatList) {
            setIsCreateModalOpen(true);
        } else if (isChatDetail && !isUserInfo && params.chatId) {
            navigate(`/chats/${params.chatId}/info`);
        }
    };

    const handleCreateSuccess = () => {
        setIsCreateModalOpen(false);
    };

    const getTitle = () => {
        if (isChatList) {
            return 'Inbox';
        }
        if (isChatDetail && chatInfo) {
            return chatInfo.name;
        }
        return 'Chat';
    };

    const getSubtitle = () => {
        if (isChatDetail && !isUserInfo && !chatInfo?.isGroup) {
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
        <>
            <div className={styles.layout}>
                <div className={styles.headerContainer}>
                    <ChatHeader
                        title={getTitle()}
                        subtitle={getSubtitle()}
                        onBack={handleBack}
                        onAction={isUserInfo ? undefined : handleAction}
                        actionIcon={getActionIcon()}
                        showSeparator={false}
                    />
                </div>
                <div className={styles.content}>
                    <Outlet />
                </div>
            </div>
            <CreateGroupChatModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSuccess={handleCreateSuccess}
            />
        </>
    );
};

