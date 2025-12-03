import React, { useState } from 'react';
import styles from './ShareComponent.module.css';
import { Button, Modal, CopyIcon, QRCode as QRCodeIcon } from '@shared/ui';
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

  const { data: linkData, isLoading: linkLoading, error: linkError } = useGetShareLinkQuery(
    { entityType, entityId },
    { skip: !isOpen }
  );

  const { data: qrData, isLoading: qrLoading, error: qrError } = useGetShareQrQuery(
    { entityType, entityId },
    { skip: !isOpen }
  );

  const handleCopyLink = async () => {
    if (!linkData?.url) {
      showError('No link available to copy');
      return;
    }

    try {
      await navigator.clipboard.writeText(linkData.url);
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
          <div className={styles.sectionHeader}>
            <QRCodeIcon className={styles.sectionIcon} />
            <h4 className={styles.sectionTitle}>QR Code</h4>
          </div>
          <div className={styles.qrCodeContainer}>
            {qrLoading && (
              <div className={styles.loadingState}>
                <div className={styles.spinner} />
                <p className={styles.loadingText}>Generating QR code...</p>
              </div>
            )}
            {qrError && (
              <div className={styles.errorState}>
                <p className={styles.errorText}>Failed to load QR code</p>
              </div>
            )}
            {qrData && !qrLoading && !qrError && (
              <div
                className={styles.qrCode}
                dangerouslySetInnerHTML={{ __html: qrData }}
              />
            )}
          </div>
        </div>

        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <CopyIcon className={styles.sectionIcon} />
            <h4 className={styles.sectionTitle}>Link</h4>
          </div>
          <div className={styles.linkContainer}>
            {linkLoading && (
              <div className={styles.loadingState}>
                <div className={styles.spinner} />
                <p className={styles.loadingText}>Loading link...</p>
              </div>
            )}
            {linkError && (
              <div className={styles.errorState}>
                <p className={styles.errorText}>Failed to load link</p>
              </div>
            )}
            {linkData?.url && !linkLoading && !linkError && (
              <>
                <div className={styles.linkBox}>
                  <p className={styles.linkText}>{linkData.url}</p>
                </div>
                <Button
                  variant="filled"
                  theme="dark"
                  size="medium"
                  shape="cr-16"
                  fullWidth
                  onClick={handleCopyLink}
                  icon={<CopyIcon />}
                >
                  {copiedLink ? 'Copied!' : 'Copy Link'}
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};

