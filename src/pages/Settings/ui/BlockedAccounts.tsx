import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './BlockedAccounts.module.css';
import { Button, Modal, LeftArrow, LoadingImage } from '@shared/ui';


interface BlockedUser {
  id: number;
  username: string;
  publicIdentifier: string;
  avatarUrl?: string;
}

export const BlockedAccounts: React.FC = () => {
  const navigate = useNavigate();
  const [blockedUsers] = useState<BlockedUser[]>([]);

  const [showUnblockModal, setShowUnblockModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<BlockedUser | null>(null);

  const handleUnblock = async () => {
    if (!selectedUser) return;
    
    console.log('Unblock user:', selectedUser.id);
    setShowUnblockModal(false);
    setSelectedUser(null);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Button
          icon={<LeftArrow />}
          size="medium"
          variant="filled"
          theme="dark"
          onClick={() => navigate(-1)}
          className={styles.backButton}
          iconOnly
        />
        <h2 className={styles.title}>Blocked Accounts</h2>
      </div>
      
      <div className={styles.content}>
        <p className={styles.description}>
          Blocked accounts cannot view your profile, send you messages, or interact with your content.
        </p>

        {blockedUsers.length > 0 ? (
          <div className={styles.userList}>
            {blockedUsers.map((user) => (
              <div key={user.id} className={styles.userCard}>
                <div className={styles.userInfo}>
                  {user.avatarUrl ? (
                    <div className={styles.avatarWrapper}>
                      <LoadingImage src={user.avatarUrl} alt={user.username} />
                    </div>
                  ) : (
                    <div className={styles.avatarPlaceholder}>
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className={styles.userDetails}>
                    <span className={styles.username}>{user.username}</span>
                    <span className={styles.identifier}>{user.publicIdentifier}</span>
                  </div>
                </div>
                <Button
                  variant="filled"
                  theme="light"
                  size="small"
                  onClick={() => {
                    setSelectedUser(user);
                    setShowUnblockModal(true);
                  }}
                >
                  Unblock
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.noUsers}>
            <p>No blocked accounts</p>
            <p className={styles.noUsersSubtext}>
              Users you block will appear here
            </p>
          </div>
        )}
      </div>

      <Modal isOpen={showUnblockModal} onClose={() => setShowUnblockModal(false)}>
        <div className={styles.modalContent}>
          <h2 className={styles.modalTitle}>Unblock User</h2>
          <p className={styles.modalText}>
            Are you sure you want to unblock {selectedUser?.username}? 
            They will be able to view your profile and interact with your content again.
          </p>
          <div className={styles.modalActions}>
            <Button variant="filled" theme="light" onClick={() => setShowUnblockModal(false)}>
              Cancel
            </Button>
            <Button variant="filled" theme="dark" onClick={handleUnblock}>
              Unblock
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

