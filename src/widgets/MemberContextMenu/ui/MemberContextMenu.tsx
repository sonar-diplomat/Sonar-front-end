import React from 'react';
import { Modal, Button } from '@shared/ui';
import { ProfileIcon, BlockIcon } from '@shared/ui';
import styles from './MemberContextMenu.module.css';

interface MemberContextMenuProps {
    isOpen: boolean;
    onClose: () => void;
    memberId: number;
    memberUserName: string;
    memberPublicIdentifier: string;
    isAdmin: boolean;
    onGoToProfile: () => void;
    onBlockUser?: () => void;
    onRemoveFromChat?: () => void;
}

export const MemberContextMenu: React.FC<MemberContextMenuProps> = ({
    isOpen,
    onClose,
    memberId,
    memberUserName,
    memberPublicIdentifier,
    isAdmin,
    onGoToProfile,
    onBlockUser,
    onRemoveFromChat,
}) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <div className={styles.container}>
                <div className={styles.header}>
                    <h3 className={styles.title}>{memberUserName}</h3>
                    <span className={styles.subtitle}>@{memberPublicIdentifier}</span>
                </div>
                <div className={styles.actions}>
                    <Button
                        variant="text"
                        theme="dark"
                        className={styles.actionItem}
                        onClick={() => {
                            onGoToProfile();
                            onClose();
                        }}
                    >
                        <div className={styles.actionLeft}>
                            <ProfileIcon className={styles.actionIcon} color="#fff" />
                            <span className={styles.actionText}>Go to profile</span>
                        </div>
                    </Button>
                    {isAdmin && onBlockUser && (
                        <Button
                            variant="text"
                            theme="dark"
                            className={styles.actionItem}
                            onClick={() => {
                                onBlockUser();
                                onClose();
                            }}
                        >
                            <div className={styles.actionLeft}>
                                <BlockIcon className={styles.actionIcon} color="#fff" />
                                <span className={styles.actionText}>Block user</span>
                            </div>
                        </Button>
                    )}
                    {isAdmin && onRemoveFromChat && (
                        <Button
                            variant="text"
                            theme="dark"
                            className={`${styles.actionItem} ${styles.danger}`}
                            onClick={() => {
                                onRemoveFromChat();
                                onClose();
                            }}
                        >
                            <div className={styles.actionLeft}>
                                <BlockIcon className={styles.actionIcon} color="#FF3B30" />
                                <span className={styles.actionText}>Remove from chat</span>
                            </div>
                        </Button>
                    )}
                </div>
            </div>
        </Modal>
    );
};

