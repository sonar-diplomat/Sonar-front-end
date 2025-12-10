import React, { useState, useMemo } from 'react';
import styles from './ReportComponent.module.css';
import { Button, Radio, Modal } from '@shared/ui';
import { useCreateReportMutation, useGetReportReasonTypesByEntityTypeQuery } from '@shared/api';
import type { CreateReportDTO } from '@entities/Report';
import { useNotifications } from '@shared/store/notificationStore';
import {
  getReportDescription,
} from '@shared/config/report.config';

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
  description,
}) => {
  const [createReport, { isLoading: isSubmitting }] = useCreateReportMutation();
  const { data: reasonTypes, isLoading: reasonTypesLoading } = useGetReportReasonTypesByEntityTypeQuery(entityTypeId);
  const { showSuccess, showError } = useNotifications();

  const [selectedReason, setSelectedReason] = useState<number | null>(null);

  // Get description for the entity type
  const defaultDescription = useMemo(() => getReportDescription(entityTypeId), [entityTypeId]);
  const finalDescription = description || defaultDescription;

  const handleReasonChange = (reasonId: number, checked: boolean) => {
    if (checked) {
      setSelectedReason(reasonId);
    } else {
      setSelectedReason(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedReason === null) {
      showError('Please select a reason');
      return;
    }

    try {
      const dto: CreateReportDTO = {
        entityIdentifier: entityId,
        reportableEntityTypeId: entityTypeId,
        reportReasonTypeId: selectedReason,
      };

      await createReport(dto).unwrap();
      showSuccess('Report submitted successfully. Thank you for helping keep Sonar safe.');
      setSelectedReason(null);
      onSuccess?.();
    } catch (err: any) {
      showError(err?.data?.message || 'Failed to submit report. Please try again.', err?.data?.errors || err?.data?.details);
    }
  };

  const renderContent = () => (
    <div className={styles.container}>
      <div className={styles.header}>
        <p className={styles.description}>{finalDescription}</p>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        {reasonTypes && reasonTypes.length > 0 && (
          <div className={styles.reasonsSection}>
            <p className={styles.reasonsHelper}>Select a reason</p>
            <div className={styles.reasonsList}>
              {reasonTypes.map((reason) => (
                <div key={reason.id} className={styles.reasonItem}>
                  <Radio
                    label={reason.name}
                    checked={selectedReason === reason.id}
                    onChange={(checked) => handleReasonChange(reason.id, checked)}
                    name="reportReason"
                    value={reason.id}
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
            disabled={!reasonTypes || reasonTypes.length === 0 || selectedReason === null}
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

