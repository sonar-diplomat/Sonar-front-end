import React,{ useRef,useState } from 'react';

import { useAddUserToChatMutation,useCreateChatMutation,useGetChatsQuery } from '@entities/Chat/api/rtkApi';
import { createGroupChatWithMembers } from '@entities/Chat/model/createGroupChat';
import { useGetUserProfileByIdentifierQuery } from '@entities/User/api/rtkApi';
import { useCurrentUserId } from '@shared/lib/auth/useCurrentUserId';
import { Button,ClearIcon,Input,LeftArrow,Modal,PlusIcon,SearchIcon } from '@shared/ui';

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
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [hasCreatedChat, setHasCreatedChat] = useState(false);
    const [creationError, setCreationError] = useState<string | null>(null);
    const submissionPending = useRef(false);

    const { data: searchedUser, isLoading: isSearching, error: searchError } = useGetUserProfileByIdentifierQuery(
        searchIdentifier!,
        {
            skip: !searchIdentifier || searchIdentifier.length === 0,
        }
    );

    const [createChat] = useCreateChatMutation();
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
        if (!chatName.trim() || selectedUsers.length === 0 || !currentUserId ||
            submissionPending.current || hasCreatedChat) {
            return;
        }

        submissionPending.current = true;
        setIsSubmitting(true);
        setCreationError(null);
        try {
            await createGroupChatWithMembers({
                name: chatName.trim(),
                isGroup: true,
                coverId: 1,
            }, currentUserId, selectedUsers.map(user => user.id), {
                getChats: () => refetchChats().unwrap(),
                createChat: async dto => {
                    await createChat(dto).unwrap();
                    setHasCreatedChat(true);
                },
                addUserToChat: async args => { await addUserToChat(args).unwrap(); },
            });

            onSuccess?.();
            resetAndClose();
        } catch (error) {
            setCreationError(error instanceof Error ? error.message : 'Could not create the group chat. Check your chats before trying again.');
        } finally {
            submissionPending.current = false;
            setIsSubmitting(false);
        }
    };

    const resetAndClose = () => {
        setChatName('');
        setSearchQuery('');
        setSelectedUsers([]);
        setSearchIdentifier(null);
        setHasCreatedChat(false);
        setCreationError(null);
        onClose();
    };

    const handleClose = () => {
        if (!submissionPending.current) resetAndClose();
    };

    const canCreate = chatName.trim().length > 0 && selectedUsers.length > 0 &&
        !!currentUserId && !isSubmitting && !hasCreatedChat;

    return (
        <Modal isOpen={isOpen} onClose={handleClose} ariaLabel="Create group chat">
            <div className={styles.container}>
                <div className={styles.header}>
                    <Button
                        variant="text"
                        theme="dark"
                        size="medium"
                        iconOnly
                        icon={<LeftArrow />}
                        aria-label="Cancel group creation"
                        disabled={isSubmitting}
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
                            disabled={isSubmitting || hasCreatedChat}
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
                                disabled={isSubmitting || hasCreatedChat}
                            />
                            <Button
                                variant="filled"
                                theme="light"
                                size="medium"
                                icon={<SearchIcon />}
                                aria-label="Search members"
                                onClick={handleSearch}
                                disabled={!searchQuery.trim() || isSearching || isSubmitting || hasCreatedChat}
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
                                    disabled={isSubmitting || hasCreatedChat}
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
                                            aria-label={`Remove ${user.userName}`}
                                            onClick={() => handleRemoveUser(user.id)}
                                            disabled={isSubmitting || hasCreatedChat}
                                        />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className={styles.footer}>
                    {creationError && (
                        <div className={styles.errorMessage} role="alert">{creationError}</div>
                    )}
                    <Button
                        variant="filled"
                        theme="light"
                        size="medium"
                        shape="cr-16"
                        onClick={handleCreate}
                        disabled={!canCreate}
                        loading={isSubmitting}
                        fullWidth
                    >
                        Create group chat
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

