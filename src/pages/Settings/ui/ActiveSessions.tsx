import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './ActiveSessions.module.css';
import { Button, Modal, LeftArrow } from '@shared/ui';
import { useSessions } from '@features/auth/model/store';
import type { ActiveSessionDTO } from '@features/auth';

export const ActiveSessions: React.FC = () => {
  const navigate = useNavigate();
  const { data: sessions, loading, refetch, revoke, revokeAll } = useSessions();
  const [showRevokeModal, setShowRevokeModal] = useState(false);
  const [showRevokeAllModal, setShowRevokeAllModal] = useState(false);
  const [selectedSessionId, setSelectedSessionId] = useState<number | null>(null);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const handleRevokeSession = async () => {
    if (selectedSessionId !== null) {
      const result = await revoke(selectedSessionId);
      if (result.success) {
        setShowRevokeModal(false);
        setSelectedSessionId(null);
      }
    }
  };

  const handleRevokeAll = async () => {
    const result = await revokeAll();
    if (result.success) {
      setShowRevokeAllModal(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
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
        <h2 className={styles.title}>Active Sessions</h2>
      </div>
      
      <div className={styles.content}>
        <div className={styles.contentHeader}>
          <p className={styles.description}>
            Manage your active sessions across all devices
          </p>
          {sessions && sessions.length > 1 && (
            <Button
              variant="filled"
              theme="dark"
              size="medium"
              onClick={() => setShowRevokeAllModal(true)}
            >
              Revoke All Sessions
            </Button>
          )}
        </div>

        {loading ? (
          <div className={styles.loading}>Loading sessions...</div>
        ) : sessions && sessions.length > 0 ? (
          <div className={styles.sessions}>
            {sessions.map((session: ActiveSessionDTO) => (
              <div key={session.id} className={styles.sessionCard}>
                <div className={styles.sessionInfo}>
                  <div className={styles.sessionHeader}>
                    <span className={styles.deviceName}>
                      {session.deviceName || 'Unknown Device'}
                    </span>
                  </div>
                  <div className={styles.sessionDetails}>
                    {session.userAgent && (
                      <span className={styles.detail}>{session.userAgent}</span>
                    )}
                    {session.ipAddress && (
                      <span className={styles.detail}>{session.ipAddress}</span>
                    )}
                    <span className={styles.detail}>
                      Last active: {formatDate(session.lastActive)}
                    </span>
                    <span className={styles.detail}>
                      Created: {formatDate(session.createdAt)}
                    </span>
                  </div>
                </div>
                <Button
                  variant="filled"
                  theme="light"
                  size="small"
                  onClick={() => {
                    setSelectedSessionId(session.id);
                    setShowRevokeModal(true);
                  }}
                >
                  Revoke
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.noSessions}>No active sessions found</div>
        )}
      </div>

      <Modal isOpen={showRevokeModal} onClose={() => setShowRevokeModal(false)}>
        <div className={styles.modalContent}>
          <h2 className={styles.modalTitle}>Revoke Session</h2>
          <p className={styles.modalText}>
            Are you sure you want to revoke this session? You will be logged out from that device.
          </p>
          <div className={styles.modalActions}>
            <Button variant="filled" theme="light" onClick={() => setShowRevokeModal(false)}>
              Cancel
            </Button>
            <Button variant="filled" theme="dark" onClick={handleRevokeSession}>
              Revoke
            </Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={showRevokeAllModal} onClose={() => setShowRevokeAllModal(false)}>
        <div className={styles.modalContent}>
          <h2 className={styles.modalTitle}>Revoke All Sessions</h2>
          <p className={styles.modalText}>
            Are you sure you want to revoke all sessions? You will be logged out from all devices except this one.
          </p>
          <div className={styles.modalActions}>
            <Button variant="filled" theme="light" onClick={() => setShowRevokeAllModal(false)}>
              Cancel
            </Button>
            <Button variant="filled" theme="dark" onClick={handleRevokeAll}>
              Revoke All
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

