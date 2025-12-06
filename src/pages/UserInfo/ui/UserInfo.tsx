import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Checkbox, ProfileIcon, Info, PlusIcon, ErrorIcon, LoadingPlaceholder } from '@shared/ui';
import { 
    useGetChatInfoQuery,
    useLeaveChatMutation,
} from '@entities/Chat/api/rtkApi';
import styles from './UserInfo.module.css';

export const UserInfo: React.FC = () => {
    const { chatId } = useParams<{ chatId: string }>();
    const navigate = useNavigate();
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);
    const currentUserId = 1;

    const chatIdNumber = chatId ? Number(chatId) : 0;
    
    // RTK Query hooks
    const { data: chatInfo, isLoading, error } = useGetChatInfoQuery(chatIdNumber, {
        skip: !chatIdNumber,
    });
    
    const [leaveChat] = useLeaveChatMutation();

    const handleGoToProfile = () => {
        console.log('Go to profile');
    };

    const handleReport = () => {
        console.log('Report user');
    };

    const handleBlockUser = () => {
        console.log('Block user');
    };

    const handleDeleteChat = () => {
        console.log('Delete chat');
    };

    if (isLoading) {
        return (
            <div className={styles.container}>
                <div className={styles.emptyState}>
                    <LoadingPlaceholder variant="spinner" text="Loading chat info..." />
                </div>
            </div>
        );
    }

    if (error || !chatInfo) {
        return (
            <div className={styles.container}>
                <div className={styles.emptyState}>
                    <div className={styles.errorIcon}>
                        <ErrorIcon />
                    </div>
                    <h2 className={styles.emptyTitle}>Chat not found</h2>
                    <p className={styles.emptyText}>The chat you're looking for doesn't exist or has been deleted.</p>
                </div>
            </div>
        );
    }

    const chatName = chatInfo.name;
    const isGroup = chatInfo.isGroup;
    const membersCount = chatInfo.userIds?.length || 0;

    const handleAddMembers = () => {
        console.log('Add members');
    };

    const handleLeaveGroup = async () => {
        if (!chatIdNumber) return;
        
        try {
            await leaveChat(chatIdNumber).unwrap();
            navigate('/chats');
        } catch (error) {
            console.error('Failed to leave chat:', error);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.profileSection}>
                <div className={styles.profileImage}>
                    <div className={styles.profilePlaceholder}>
                        {chatName.charAt(0).toUpperCase()}
                    </div>
                </div>
                <div className={styles.profileInfo}>
                    <div className={styles.nameRow}>
                        <h2 className={styles.name}>{chatName}</h2>
                        {!isGroup && (
                            <div className={styles.verifiedBadge}>
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                    <path
                                        d="M8 0L9.79741 3.20259L13.2026 4.79741L10 6.59482L11.5954 10L8 8L4.40418 10L6 6.59482L2.79741 4.79741L6.20259 3.20259L8 0Z"
                                        fill="currentColor"
                                    />
                                </svg>
                            </div>
                        )}
                    </div>
                    <p className={styles.status}>
                        {isGroup ? `${membersCount} members` : 'Last seen recently'}
                    </p>
                </div>
            </div>

            {isGroup && chatInfo.userIds && chatInfo.userIds.length > 0 && (
                <div className={styles.membersSection}>
                    <div className={styles.membersHeader}>
                        <span className={styles.membersTitle}>Members</span>
                        <span className={styles.membersCount}>{membersCount}</span>
                    </div>
                    <div className={styles.membersList}>
                        {chatInfo.userIds.map((userId) => (
                            <div key={userId} className={styles.memberItem}>
                                <div className={styles.memberAvatar}>
                                    <div className={styles.memberAvatarPlaceholder}>
                                        {userId === currentUserId ? 'Y' : 'U'}
                                    </div>
                                </div>
                                <span className={styles.memberName}>
                                    {userId === currentUserId ? 'You' : `User ${userId}`}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className={styles.optionsList}>
                <div className={styles.optionItem}>
                    <div className={styles.optionLeft}>
                        <svg className={styles.optionIcon} width="20" height="20" viewBox="0 0 20 20" fill="none">
                            <path
                                d="M10 2C8.89543 2 8 2.89543 8 4V6H4C3.44772 6 3 6.44772 3 7V15C3 16.1046 3.89543 17 5 17H15C16.1046 17 17 16.1046 17 15V7C17 6.44772 16.5523 6 16 6H12V4C12 2.89543 11.1046 2 10 2ZM10 4C10.5523 4 11 4.44772 11 5V6H9V5C9 4.44772 9.44772 4 10 4ZM5 8H15V15H5V8Z"
                                fill="currentColor"
                            />
                        </svg>
                        <span className={styles.optionText}>Notification</span>
                    </div>
                    <Checkbox
                        checked={notificationsEnabled}
                        onChange={setNotificationsEnabled}
                    />
                </div>

                {!isGroup && (
                    <button className={styles.optionItem} onClick={handleGoToProfile}>
                        <div className={styles.optionLeft}>
                            <ProfileIcon className={styles.optionIcon} />
                            <span className={styles.optionText}>Go to profile</span>
                        </div>
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                            <path
                                d="M4.5 9L7.5 6L4.5 3"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                    </button>
                )}

                {isGroup && (
                    <button className={styles.optionItem} onClick={handleAddMembers}>
                        <div className={styles.optionLeft}>
                            <PlusIcon className={styles.optionIcon} />
                            <span className={styles.optionText}>Add members</span>
                        </div>
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                            <path
                                d="M4.5 9L7.5 6L4.5 3"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                    </button>
                )}

                {!isGroup && (
                    <>
                        <button className={styles.optionItem} onClick={handleReport}>
                            <div className={styles.optionLeft}>
                                <Info className={styles.optionIcon} />
                                <span className={styles.optionText}>Report</span>
                            </div>
                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                                <path
                                    d="M4.5 9L7.5 6L4.5 3"
                                    stroke="currentColor"
                                    strokeWidth="1.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                        </button>

                        <button className={styles.optionItem} onClick={handleBlockUser}>
                            <div className={styles.optionLeft}>
                                <svg className={styles.optionIcon} width="20" height="20" viewBox="0 0 20 20" fill="none">
                                    <path
                                        d="M10 2C5.58172 2 2 5.58172 2 10C2 14.4183 5.58172 18 10 18C14.4183 18 18 14.4183 18 10C18 5.58172 14.4183 2 10 2ZM10 4C13.3137 4 16 6.68629 16 10C16 11.2958 15.5892 12.4957 14.8906 13.4766L6.52344 5.10938C7.50433 4.41083 8.70418 4 10 4ZM4 10C4 8.70418 4.41083 7.50433 5.10938 6.52344L13.4766 14.8906C12.4957 15.5892 11.2958 16 10 16C6.68629 16 4 13.3137 4 10Z"
                                        fill="currentColor"
                                    />
                                </svg>
                                <span className={styles.optionText}>Block user</span>
                            </div>
                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                                <path
                                    d="M4.5 9L7.5 6L4.5 3"
                                    stroke="currentColor"
                                    strokeWidth="1.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                        </button>
                    </>
                )}

                {isGroup && (
                    <button className={`${styles.optionItem} ${styles.danger}`} onClick={handleLeaveGroup}>
                        <div className={styles.optionLeft}>
                            <svg className={styles.optionIcon} width="20" height="20" viewBox="0 0 20 20" fill="none">
                                <path
                                    d="M10 2C5.58172 2 2 5.58172 2 10C2 14.4183 5.58172 18 10 18C14.4183 18 18 14.4183 18 10C18 5.58172 14.4183 2 10 2ZM10 4C13.3137 4 16 6.68629 16 10C16 11.2958 15.5892 12.4957 14.8906 13.4766L6.52344 5.10938C7.50433 4.41083 8.70418 4 10 4ZM4 10C4 8.70418 4.41083 7.50433 5.10938 6.52344L13.4766 14.8906C12.4957 15.5892 11.2958 16 10 16C6.68629 16 4 13.3137 4 10Z"
                                    fill="currentColor"
                                />
                            </svg>
                            <span className={styles.optionText}>Leave group</span>
                        </div>
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                            <path
                                d="M4.5 9L7.5 6L4.5 3"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                    </button>
                )}

                <button className={`${styles.optionItem} ${styles.danger}`} onClick={handleDeleteChat}>
                    <div className={styles.optionLeft}>
                        <svg className={styles.optionIcon} width="20" height="20" viewBox="0 0 20 20" fill="none">
                            <path
                                d="M6 6V16C6 17.1046 6.89543 18 8 18H12C13.1046 18 14 17.1046 14 16V6M8 6V4C8 2.89543 8.89543 2 10 2C11.1046 2 12 2.89543 12 4V6M4 6H16"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                        <span className={styles.optionText}>{isGroup ? 'Delete group' : 'Delete chat'}</span>
                    </div>
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <path
                            d="M4.5 9L7.5 6L4.5 3"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                </button>
            </div>
        </div>
    );
};

