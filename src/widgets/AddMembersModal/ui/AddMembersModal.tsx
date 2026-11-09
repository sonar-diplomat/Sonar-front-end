import React,{ useRef,useState } from 'react';

import { useAddUserToChatMutation } from '@entities/Chat/api/rtkApi';
import { useGetUserProfileByIdentifierQuery } from '@entities/User/api/rtkApi';
import { useCurrentUserId } from '@shared/lib/auth/useCurrentUserId';
import { Button,ClearIcon,Input,LeftArrow,Modal,PlusIcon,SearchIcon } from '@shared/ui';

import styles from './AddMembersModal.module.css';

interface SelectedUser {
    id: number;
    userName: string;
    publicIdentifier: string;
}

interface AddMembersModalProps {
    isOpen: boolean;
    onClose: () => void;
    chatId: number;
    existingUserIds: number[];
    onSuccess?: () => void;
}

export const AddMembersModal: React.FC<AddMembersModalProps> = props =>
    props.isOpen ? <AddMembersDialog key={props.chatId} {...props} /> : null;

const AddMembersDialog: React.FC<AddMembersModalProps> = ({
    isOpen,
    onClose,
    chatId,
    existingUserIds,
    onSuccess,
}) => {
    const currentUserId = useCurrentUserId();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedUsers, setSelectedUsers] = useState<SelectedUser[]>([]);
    const [searchIdentifier, setSearchIdentifier] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submissionResult, setSubmissionResult] = useState<{ added: number; failed: number } | null>(null);
    const submitting = useRef(false);

    const { currentData, isFetching: isSearching, isError } = useGetUserProfileByIdentifierQuery(
        searchIdentifier ?? '',
        {
            skip: !searchIdentifier,
            refetchOnMountOrArgChange: true,
        }
    );
    const searchedUser = searchIdentifier && !isSearching && !isError ? currentData : undefined;
    const searchError = !!searchIdentifier && !isSearching && isError;

    const [addUserToChat] = useAddUserToChatMutation();

    const handleSearch = () => {
        if (searchQuery.trim().length > 0) {
            setSearchIdentifier(searchQuery.trim());
        }
    };

    const handleAddUser = () => {
        if (submitting.current) return;
        if (searchedUser && !selectedUsers.some(u => u.id === searchedUser.id)) {
            if (searchedUser.id === currentUserId) {
                return;
            }
            if (existingUserIds.includes(searchedUser.id)) {
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
        if (submitting.current) return;
        setSelectedUsers(selectedUsers.filter(u => u.id !== userId));
    };

    const handleAddMembers = async () => {
        if (submitting.current || selectedUsers.length === 0) return;
        submitting.current = true;
        setIsSubmitting(true);
        setSubmissionResult(null);
        const failed: SelectedUser[] = [];
        try {
            for (const user of selectedUsers) {
                try {
                    await addUserToChat({
                        chatId,
                        userId: user.id,
                    }).unwrap();
                } catch {
                    failed.push(user);
                }
            }
        } finally {
            submitting.current = false;
            setIsSubmitting(false);
        }
        if (failed.length) {
            setSelectedUsers(failed);
            setSubmissionResult({ added: selectedUsers.length - failed.length, failed: failed.length });
        } else {
            onSuccess?.();
            handleClose();
        }
    };

    const handleClose = () => {
        if (submitting.current) return;
        setSearchQuery('');
        setSelectedUsers([]);
        setSearchIdentifier(null);
        onClose();
    };

    const canAdd = selectedUsers.length > 0 && !isSubmitting;

    return (
        <Modal isOpen={isOpen} onClose={handleClose} ariaLabel="Add members">
            <div className={styles.container}>
                <div className={styles.header}>
                    <Button
                        variant="text"
                        theme="dark"
                        size="medium"
                        iconOnly
                        icon={<LeftArrow />}
                        aria-label="Cancel adding members"
                        onClick={handleClose}
                        disabled={isSubmitting}
                        className={styles.backButton}
                    />
                    <h2 className={styles.title}>Add members</h2>
                </div>

                <div className={styles.content}>
                    <div className={styles.section}>
                        <label className={styles.label}>Search members</label>
                        <div className={styles.searchContainer}>
                            <Input
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    setSearchIdentifier(null);
                                }}
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
                                aria-label="Search members"
                                onClick={handleSearch}
                                disabled={!searchQuery.trim() || isSearching || isSubmitting}
                                className={styles.searchButton}
                            />
                        </div>

                        {searchError && searchIdentifier && (
                            <div className={styles.errorMessage}>
                                User not found
                            </div>
                        )}

                        {searchedUser && !selectedUsers.some(u => u.id === searchedUser.id) && searchedUser.id !== currentUserId && !existingUserIds.includes(searchedUser.id) && (
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
                                    disabled={isSubmitting}
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

                        {searchedUser && existingUserIds.includes(searchedUser.id) && (
                            <div className={styles.errorMessage}>
                                User is already a member
                            </div>
                        )}

                        {searchedUser && selectedUsers.some(u => u.id === searchedUser.id) && (
                            <div className={styles.errorMessage}>
                                User already selected
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
                                            disabled={isSubmitting}
                                        />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {submissionResult && (
                    <p className={styles.errorMessage} role="alert">
                        Added {submissionResult.added}. Failed to add {submissionResult.failed}. You can retry the remaining selections.
                    </p>
                )}
                <div className={styles.footer}>
                    <Button
                        variant="filled"
                        theme="light"
                        size="medium"
                        shape="cr-16"
                        onClick={handleAddMembers}
                        disabled={!canAdd}
                        loading={isSubmitting}
                        fullWidth
                    >
                        Add members
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

