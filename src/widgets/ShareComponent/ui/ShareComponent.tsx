import React, { useState } from 'react';
import styles from './ShareComponent.module.css';
import { Button, Modal, CopyIcon } from '@shared/ui';
import { useGetShareLinkQuery, useGetShareQrQuery } from '@shared/api';
import { useNotifications } from '@shared/store/notificationStore';

export type ShareEntityType = 'Artist' | 'Track' | 'User' | 'Playlist' | 'Album' | 'Blend';

export interface ShareComponentProps {
  entityType: ShareEntityType;
  entityId: number;
  isOpen: boolean;
  onClose: () => void;
  title?: string;
}

export const ShareComponent: React.FC<ShareComponentProps> = ({
  entityType,
  entityId,
  isOpen,
  onClose,
  title = 'Share',
}) => {
  const { showSuccess, showError } = useNotifications();
  const [copiedLink, setCopiedLink] = useState(false);

  const { data: shareLink, isLoading: linkLoading, error: linkError } = useGetShareLinkQuery(
    { entityType, entityId },
    { skip: !isOpen }
  );

  const { data: qrSvg, isLoading: qrLoading, error: qrError } = useGetShareQrQuery(
    { entityType, entityId },
    { skip: !isOpen }
  );


  const handleCopyLink = async () => {
    if (!shareLink) {
      showError('No link available to copy');
      return;
    }

    try {
      await navigator.clipboard.writeText(shareLink);
      setCopiedLink(true);
      showSuccess('Link copied to clipboard');
      setTimeout(() => setCopiedLink(false), 2000);
    } catch (err) {
      showError('Failed to copy link');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className={styles.container}>

        <div className={styles.section}>
          <div className={styles.qrCodeContainer}>
            {qrLoading ? (
              <div className={styles.loadingState}>
                <div className={styles.spinner} />
                <p className={styles.loadingText}>Generating QR code...</p>
              </div>
            ) : qrError ? (
              <div className={styles.errorState}>
                <p className={styles.errorText}>Failed to load QR code</p>
              </div>
            ) : qrSvg ? (
              <div
                className={styles.qrCode}
                dangerouslySetInnerHTML={{ __html: qrSvg }}
              />
            ) : null}
          </div>
        </div>

        <div className={styles.section}>
          <div className={styles.linkContainer}>
            {linkLoading ? (
              <div className={styles.loadingState}>
                <div className={styles.spinner} />
                <p className={styles.loadingText}>Loading link...</p>
              </div>
            ) : linkError ? (
              <div className={styles.errorState}>
                <p className={styles.errorText}>Failed to load link</p>
              </div>
            ) : shareLink ? (
              <>
                <div className={styles.linkBox}>
                  <p className={styles.linkText}>{shareLink}</p>
                </div>
                <Button
                  variant="filled"
                  theme="dark"
                  size="large"
                  shape="cr-16"
                  fullWidth
                  onClick={handleCopyLink}
                  icon={<CopyIcon />}
                >
                  {copiedLink ? 'Copied!' : 'Copy Link'}
                </Button>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </Modal>
  );
};
