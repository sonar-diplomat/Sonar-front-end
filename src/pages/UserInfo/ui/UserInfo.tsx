import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Checkbox, ProfileIcon, Info, PlusIcon, ErrorIcon, LoadingPlaceholder, VerifyIcon, NotificationIcon, RightArrow, BlockIcon, DeleteIcon, Button } from '@shared/ui';
import { 
    useGetChatInfoQuery,
    useLeaveChatMutation,
    useRemoveUserFromChatMutation,
} from '@entities/Chat/api/rtkApi';
import { useGetUserByIdQuery, useGetUserProfileByIdentifierQuery } from '@entities/User/api/rtkApi';
import { usePatchClientSettingsMutation, useGetClientSettingsQuery } from '@entities/ClientSettings/api/rtkApi';
import { useCurrentUserId } from '@shared/lib/auth/useCurrentUserId';
import { MemberContextMenu } from '@widgets/MemberContextMenu';
import { AddMembersModal } from '@widgets/AddMembersModal';
import { MemberItem } from './MemberItem';
import styles from './UserInfo.module.css';

export const UserInfo: React.FC = () => {
    const { chatId } = useParams<{ chatId: string }>();
    const navigate = useNavigate();
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);
    const [selectedMemberId, setSelectedMemberId] = useState<number | null>(null);
    const [isMemberMenuOpen, setIsMemberMenuOpen] = useState(false);
    const [isAddMembersModalOpen, setIsAddMembersModalOpen] = useState(false);
    const currentUserId = useCurrentUserId();

    const chatIdNumber = chatId ? Number(chatId) : 0;
    
    const { data: chatInfo, isLoading, error, refetch: refetchChatInfo } = useGetChatInfoQuery(chatIdNumber, {
        skip: !chatIdNumber,
    });
    
    const [leaveChat, { isLoading: isLeavingChat }] = useLeaveChatMutation();
    const [removeUserFromChat] = useRemoveUserFromChatMutation();
    const [patchSettings, { isLoading: isBlockingUser }] = usePatchClientSettingsMutation();
    const { data: currentSettings } = useGetClientSettingsQuery(undefined, {
        skip: !currentUserId,
    });

    const isAdmin = useMemo(() => {
        if (!chatInfo || !currentUserId) return false;
        return chatInfo.creatorId === currentUserId || chatInfo.adminIds?.includes(currentUserId);
    }, [chatInfo, currentUserId]);

    const otherUserId = useMemo(() => {
        if (!chatInfo || !currentUserId || chatInfo.isGroup) return null;
        const otherUser = chatInfo.userIds?.find(id => id !== currentUserId);
        return otherUser || null;
    }, [chatInfo, currentUserId]);

    const { data: otherUserData } = useGetUserByIdQuery(otherUserId!, {
        skip: !otherUserId,
    });

    const { data: selectedMemberUserData } = useGetUserByIdQuery(selectedMemberId!, {
        skip: !selectedMemberId,
    });

    const { data: selectedMemberProfileData } = useGetUserProfileByIdentifierQuery(
        selectedMemberUserData?.publicIdentifier || '',
        {
            skip: !selectedMemberUserData?.publicIdentifier,
        }
    );

    const handleGoToProfile = () => {
        if (otherUserData?.publicIdentifier) {
            navigate(`/user/${otherUserData.publicIdentifier}`);
        }
    };

    const handleReport = () => {
        console.log('Report user');
    };

    const handleBlockUser = async () => {
        if (!otherUserId || !currentSettings) {
            console.warn('Cannot block user: missing otherUserId or currentSettings');
            return;
        }
        
        try {
            const currentBlockedIds = currentSettings.blockedUserIds || [];
            
            if (currentBlockedIds.includes(otherUserId)) {
                console.log('User is already blocked');
                return;
            }
            
            const updatedBlockedIds = [...currentBlockedIds, otherUserId];
            
            console.log('Blocking user:', { otherUserId, updatedBlockedIds });
            
            await patchSettings({
                blockedUserIds: updatedBlockedIds,
            }).unwrap();
            
            console.log('User blocked successfully');
            
            navigate('/chats');
        } catch (error) {
            console.error('Failed to block user:', error);
        }
    };

    const handleDeleteChat = async () => {
        if (!chatIdNumber) return;
        
        try {
            await leaveChat(chatIdNumber).unwrap();
            navigate('/chats');
        } catch (error) {
            console.error('Failed to delete chat:', error);
        }
    };

    const handleAddMembers = () => {
        setIsAddMembersModalOpen(true);
    };

    const handleMemberClick = (userId: number) => {
        setSelectedMemberId(userId);
        setIsMemberMenuOpen(true);
    };

    const handleGoToMemberProfile = () => {
        if (!selectedMemberUserData?.publicIdentifier) return;
        navigate(`/user/${selectedMemberUserData.publicIdentifier}`);
    };

    const selectedMemberUserName = selectedMemberProfileData?.userName || (selectedMemberId ? `User ${selectedMemberId}` : '');

    const handleBlockMember = async () => {
        if (!selectedMemberId || !currentSettings) return;
        
        try {
            const currentBlockedIds = currentSettings.blockedUserIds || [];
            const updatedBlockedIds = [...currentBlockedIds, selectedMemberId];
            
            await patchSettings({
                blockedUserIds: updatedBlockedIds,
            }).unwrap();
            
            navigate('/chats');
        } catch (error) {
            console.error('Failed to block user:', error);
        }
    };

    const handleRemoveMemberFromChat = async () => {
        if (!selectedMemberId || !chatIdNumber) return;
        
        try {
            await removeUserFromChat({
                chatId: chatIdNumber,
                userId: selectedMemberId,
            }).unwrap();
            await refetchChatInfo();
        } catch (error) {
            console.error('Failed to remove user from chat:', error);
        }
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
                                <VerifyIcon />
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
                            <MemberItem
                                key={userId}
                                userId={userId}
                                currentUserId={currentUserId}
                                onClick={() => handleMemberClick(userId)}
                            />
                        ))}
                    </div>
                </div>
            )}

            <div className={styles.optionsList}>
                <div className={styles.optionItem}>
                    <div className={styles.optionLeft}>
                        <NotificationIcon className={styles.optionIcon} color="#fff" />
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
                            <ProfileIcon className={styles.optionIcon} color="#fff" />
                            <span className={styles.optionText}>Go to profile</span>
                        </div>
                        <RightArrow className={styles.arrowIcon} color="#fff" />
                    </button>
                )}

                {isGroup && isAdmin && (
                    <Button 
                        variant="text" 
                        theme="dark" 
                        className={styles.optionItem} 
                        onClick={handleAddMembers}
                    >
                        <div className={styles.optionLeft}>
                            <PlusIcon className={styles.optionIcon} color="#fff" />
                            <span className={styles.optionText}>Add members</span>
                        </div>
                        <RightArrow className={styles.arrowIcon} color="#fff" />
                    </Button>
                )}

                {!isGroup && (
                    <>
                        <button className={styles.optionItem} onClick={handleReport}>
                            <div className={styles.optionLeft}>
                                <Info className={styles.optionIcon} color="#fff" />
                                <span className={styles.optionText}>Report</span>
                            </div>
                            <RightArrow className={styles.arrowIcon} color="#fff" />
                        </button>

                        <button 
                            className={styles.optionItem} 
                            onClick={handleBlockUser}
                            disabled={!otherUserId || !currentSettings || isBlockingUser}
                        >
                            <div className={styles.optionLeft}>
                                <BlockIcon className={styles.optionIcon} color="#fff" />
                                <span className={styles.optionText}>Block user</span>
                            </div>
                            <RightArrow className={styles.arrowIcon} color="#fff" />
                        </button>
                    </>
                )}

                {isGroup && (
                    <button className={`${styles.optionItem} ${styles.danger}`} onClick={handleLeaveGroup}>
                        <div className={styles.optionLeft}>
                            <BlockIcon className={styles.optionIcon} color="#FF3B30" />
                            <span className={styles.optionText}>Leave group</span>
                        </div>
                        <RightArrow className={styles.arrowIcon} color="#FF3B30" />
                    </button>
                )}

                <Button 
                    variant="text" 
                    theme="dark" 
                    className={`${styles.optionItem} ${styles.danger}`} 
                    onClick={handleDeleteChat}
                    disabled={isLeavingChat}
                >
                    <div className={styles.optionLeft}>
                        <DeleteIcon className={styles.optionIcon} color="#FF3B30" />
                        <span className={styles.optionText}>{isGroup ? 'Delete group' : 'Delete chat'}</span>
                    </div>
                    <RightArrow className={styles.arrowIcon} color="#FF3B30" />
                </Button>
            </div>

            {selectedMemberId && selectedMemberUserData && (
                <MemberContextMenu
                    isOpen={isMemberMenuOpen}
                    onClose={() => {
                        setIsMemberMenuOpen(false);
                        setSelectedMemberId(null);
                    }}
                    memberId={selectedMemberId}
                    memberUserName={selectedMemberUserName}
                    memberPublicIdentifier={selectedMemberUserData.publicIdentifier || ''}
                    isAdmin={isAdmin}
                    onGoToProfile={handleGoToMemberProfile}
                    onBlockUser={isAdmin ? handleBlockMember : undefined}
                    onRemoveFromChat={isAdmin ? handleRemoveMemberFromChat : undefined}
                />
            )}

            {isGroup && (
                <AddMembersModal
                    isOpen={isAddMembersModalOpen}
                    onClose={() => setIsAddMembersModalOpen(false)}
                    chatId={chatIdNumber}
                    existingUserIds={chatInfo?.userIds || []}
                    onSuccess={() => {
                        refetchChatInfo();
                    }}
                />
            )}
        </div>
    );
};

