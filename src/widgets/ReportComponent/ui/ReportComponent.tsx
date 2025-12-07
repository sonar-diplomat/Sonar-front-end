import React, { useState } from 'react';
import styles from './ReportComponent.module.css';
import { Button, Checkbox, Modal } from '@shared/ui';
import { useCreateReportMutation, useGetReportReasonTypesQuery } from '@shared/api';
import type { CreateReportDTO } from '@entities/Report';
import { useNotifications } from '@shared/store/notificationStore';

export interface ReportComponentProps {
  entityId: number;
  entityTypeId: number;
  isModal?: boolean;
  onSuccess?: () => void;
  onCancel?: () => void;
  description?: string;
}

export const ReportComponent: React.FC<ReportComponentProps> = ({
  entityId,
  entityTypeId,
  isModal = false,
  onSuccess,
  onCancel,
  description = 'Help us keep Sonar safe. Select the reason(s) why you\'re reporting this content.',
}) => {
  const [createReport, { isLoading: isSubmitting }] = useCreateReportMutation();
  const { data: reasonTypes, isLoading: reasonTypesLoading } = useGetReportReasonTypesQuery();
  const { showSuccess, showError } = useNotifications();

  const [selectedReasons, setSelectedReasons] = useState<number[]>([]);

  const handleReasonToggle = (reasonId: number, checked: boolean) => {
    if (checked) {
      setSelectedReasons(prev => [...prev, reasonId]);
    } else {
      setSelectedReasons(prev => prev.filter(id => id !== reasonId));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedReasons.length === 0) {
      showError('Please select at least one reason');
      return;
    }

    try {
      const dto: CreateReportDTO = {
        entityIdentifier: entityId,
        reportableEntityTypeId: entityTypeId,
        reportReasonTypeIds: selectedReasons,
      };

      await createReport(dto).unwrap();
      showSuccess('Report submitted successfully. Thank you for helping keep Sonar safe.');
      setSelectedReasons([]);
      onSuccess?.();
    } catch (err: any) {
      showError(err?.data?.message || 'Failed to submit report. Please try again.', err?.data?.errors || err?.data?.details);
    }
  };

  const renderContent = () => (
    <div className={styles.container}>
      <div className={styles.header}>
        <p className={styles.description}>{description}</p>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        {reasonTypes && reasonTypes.length > 0 && (
          <div className={styles.reasonsSection}>
            <p className={styles.reasonsHelper}>Choose all that apply</p>
            <div className={styles.reasonsList}>
              {reasonTypes.map((reason) => (
                <div key={reason.id} className={styles.reasonItem}>
                  <Checkbox
                    label={reason.name}
                    checked={selectedReasons.includes(reason.id)}
                    onChange={(checked) => handleReasonToggle(reason.id, checked)}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        <div className={styles.actions}>
          {onCancel && (
            <Button
              variant="filled"
              theme="light"
              size="large"
              fullWidth
              type="button"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          )}
          <Button
            variant="filled"
            theme="dark"
            size="large"
            fullWidth
            type="submit"
            loading={isSubmitting || reasonTypesLoading}
            disabled={!reasonTypes || selectedReasons.length === 0}
          >
            Submit Report
          </Button>
        </div>
      </form>

      <div className={styles.helpText}>
        <p>Need immediate help?</p>
        <p className={styles.helpSubtext}>
          Contact our support team at support@sonar.com
        </p>
      </div>
    </div>
  );

  if (isModal) {
    return (
      <Modal isOpen={true} onClose={onCancel || (() => {})}>
        {renderContent()}
      </Modal>
    );
  }

  return renderContent();
};

