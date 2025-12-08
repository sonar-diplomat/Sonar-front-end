import React, { useState } from 'react';
import { Modal, Button, Input } from '@shared/ui';
import { SearchIcon, PlusIcon, ClearIcon, LeftArrow } from '@shared/ui';
import { useGetUserProfileByIdentifierQuery } from '@entities/User/api/rtkApi';
import { useCreateChatMutation, useAddUserToChatMutation, useGetChatsQuery } from '@entities/Chat/api/rtkApi';
import { useCurrentUserId } from '@shared/lib/auth/useCurrentUserId';
import styles from './CreateGroupChatModal.module.css';

interface SelectedUser {
    id: number;
    userName: string;
    publicIdentifier: string;
}

interface CreateGroupChatModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

export const CreateGroupChatModal: React.FC<CreateGroupChatModalProps> = ({
    isOpen,
    onClose,
    onSuccess,
}) => {
    const currentUserId = useCurrentUserId();
    const [chatName, setChatName] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedUsers, setSelectedUsers] = useState<SelectedUser[]>([]);
    const [searchIdentifier, setSearchIdentifier] = useState<string | null>(null);

    const { data: searchedUser, isLoading: isSearching, error: searchError } = useGetUserProfileByIdentifierQuery(
        searchIdentifier!,
        {
            skip: !searchIdentifier || searchIdentifier.length === 0,
        }
    );

    const [createChat, { isLoading: isCreating }] = useCreateChatMutation();
    const [addUserToChat] = useAddUserToChatMutation();
    const { refetch: refetchChats } = useGetChatsQuery();

    const handleSearch = () => {
        if (searchQuery.trim().length > 0) {
            setSearchIdentifier(searchQuery.trim());
        }
    };

    const handleAddUser = () => {
        if (searchedUser && !selectedUsers.some(u => u.id === searchedUser.id)) {
            if (searchedUser.id === currentUserId) {
                return;
            }
            setSelectedUsers([...selectedUsers, {
                id: searchedUser.id,
                userName: searchedUser.userName,
                publicIdentifier: searchedUser.publicIdentifier,
            }]);
            setSearchQuery('');
            setSearchIdentifier(null);
        }
    };

    const handleRemoveUser = (userId: number) => {
        setSelectedUsers(selectedUsers.filter(u => u.id !== userId));
    };

    const handleCreate = async () => {
        if (!chatName.trim() || selectedUsers.length === 0 || !currentUserId) {
            return;
        }

        try {
            await createChat({
                name: chatName.trim(),
                isGroup: true,
                coverId: 1,
            }).unwrap();

            const chatsResult = await refetchChats();
            const newChat = chatsResult.data?.find(c => c.name === chatName.trim() && c.isGroup && c.creatorId === currentUserId);
            
            if (newChat) {
                for (const user of selectedUsers) {
                    try {
                        await addUserToChat({
                            chatId: newChat.id,
                            userId: user.id,
                        }).unwrap();
                    } catch (error) {
                        console.error(`Failed to add user ${user.id} to chat:`, error);
                    }
                }
            }

            onSuccess?.();
            handleClose();
        } catch (error) {
            console.error('Failed to create group chat:', error);
        }
    };

    const handleClose = () => {
        setChatName('');
        setSearchQuery('');
        setSelectedUsers([]);
        setSearchIdentifier(null);
        onClose();
    };

    const canCreate = chatName.trim().length > 0 && selectedUsers.length > 0 && !isCreating;

    return (
        <Modal isOpen={isOpen} onClose={handleClose}>
            <div className={styles.container}>
                <div className={styles.header}>
                    <Button
                        variant="text"
                        theme="dark"
                        size="medium"
                        iconOnly
                        icon={<LeftArrow />}
                        onClick={handleClose}
                        className={styles.backButton}
                    />
                    <h2 className={styles.title}>Create group chat</h2>
                </div>

                <div className={styles.content}>
                    <div className={styles.section}>
                        <label className={styles.label}>Chat name</label>
                        <Input
                            value={chatName}
                            onChange={(e) => setChatName(e.target.value)}
                            placeholder="Enter chat name"
                            className={styles.input}
                        />
                    </div>

                    <div className={styles.section}>
                        <label className={styles.label}>Add members</label>
                        <div className={styles.searchContainer}>
                            <Input
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                        handleSearch();
                                    }
                                }}
                                placeholder="Search by public identifier"
                                className={styles.searchInput}
                            />
                            <Button
                                variant="filled"
                                theme="light"
                                size="medium"
                                icon={<SearchIcon />}
                                onClick={handleSearch}
                                disabled={!searchQuery.trim() || isSearching}
                                className={styles.searchButton}
                            />
                        </div>

                        {searchError && searchIdentifier && (
                            <div className={styles.errorMessage}>
                                User not found
                            </div>
                        )}

                        {searchedUser && !selectedUsers.some(u => u.id === searchedUser.id) && searchedUser.id !== currentUserId && (
                            <div className={styles.searchResult}>
                                <div className={styles.userInfo}>
                                    <span className={styles.userName}>{searchedUser.userName}</span>
                                    <span className={styles.userIdentifier}>@{searchedUser.publicIdentifier}</span>
                                </div>
                                <Button
                                    variant="filled"
                                    theme="light"
                                    size="small"
                                    icon={<PlusIcon />}
                                    onClick={handleAddUser}
                                >
                                    Add
                                </Button>
                            </div>
                        )}

                        {searchedUser && searchedUser.id === currentUserId && (
                            <div className={styles.errorMessage}>
                                You cannot add yourself
                            </div>
                        )}

                        {searchedUser && selectedUsers.some(u => u.id === searchedUser.id) && (
                            <div className={styles.errorMessage}>
                                User already added
                            </div>
                        )}

                        {selectedUsers.length > 0 && (
                            <div className={styles.selectedUsers}>
                                <div className={styles.selectedUsersTitle}>Selected members ({selectedUsers.length})</div>
                                {selectedUsers.map((user) => (
                                    <div key={user.id} className={styles.selectedUser}>
                                        <div className={styles.userInfo}>
                                            <span className={styles.userName}>{user.userName}</span>
                                            <span className={styles.userIdentifier}>@{user.publicIdentifier}</span>
                                        </div>
                                        <Button
                                            variant="text"
                                            theme="dark"
                                            size="small"
                                            iconOnly
                                            icon={<ClearIcon />}
                                            onClick={() => handleRemoveUser(user.id)}
                                        />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className={styles.footer}>
                    <Button
                        variant="filled"
                        theme="light"
                        size="medium"
                        shape="cr-16"
                        onClick={handleCreate}
                        disabled={!canCreate}
                        loading={isCreating}
                        fullWidth
                    >
                        Create group chat
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

