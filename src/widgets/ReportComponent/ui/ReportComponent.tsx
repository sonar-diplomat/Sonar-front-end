import React, { useState, useMemo, useCallback } from 'react';
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
  const { 
    data: reasonTypes, 
    isLoading: reasonTypesLoading, 
    isError: reasonTypesError,
    refetch: refetchReasonTypes
  } = useGetReportReasonTypesByEntityTypeQuery(entityTypeId, {
    skip: !entityTypeId || entityTypeId <= 0,
  });
  const { showSuccess, showError } = useNotifications();

  const [selectedReason, setSelectedReason] = useState<number | null>(null);

  // Get description for the entity type
  const defaultDescription = useMemo(() => getReportDescription(entityTypeId), [entityTypeId]);
  const finalDescription = description || defaultDescription;

  // Validate inputs
  const isValid = useMemo(() => {
    return entityId > 0 && entityTypeId > 0;
  }, [entityId, entityTypeId]);

  const handleReasonChange = useCallback((reasonId: number, checked: boolean) => {
    // For radio buttons, when clicked, checked is always true
    // We always set the selected reason when the radio is clicked
    if (checked) {
      setSelectedReason(reasonId);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate inputs
    if (!isValid) {
      showError('Invalid report data. Please refresh the page and try again.');
      return;
    }

    if (selectedReason === null) {
      showError('Please select a reason for the report');
      return;
    }

    if (!reasonTypes || reasonTypes.length === 0) {
      showError('No report reasons available. Please try again later.');
      return;
    }

    // Validate that selected reason exists in the list
    const reasonExists = reasonTypes.some(rt => rt.id === selectedReason);
    if (!reasonExists) {
      showError('Selected reason is no longer valid. Please refresh and try again.');
      setSelectedReason(null);
      return;
    }

    try {
      const dto: CreateReportDTO = {
        entityIdentifier: entityId,
        reportableEntityTypeId: entityTypeId,
        reportReasonTypeId: selectedReason,
      };

      const result = await createReport(dto).unwrap();
      
      if (result) {
        showSuccess('Report submitted successfully. Thank you for helping keep Sonar safe.');
        setSelectedReason(null);
        onSuccess?.();
      } else {
        showError('Report submission failed. Please try again.');
      }
    } catch (err: any) {
      // Enhanced error handling
      const errorMessage = err?.data?.message || err?.message || 'Failed to submit report';
      const errorDetails = err?.data?.errors || err?.data?.details || [];
      
      // Handle specific error cases
      if (err?.status === 401) {
        showError('You are not authorized to submit reports. Please log in and try again.');
      } else if (err?.status === 400) {
        showError(errorMessage, errorDetails.length > 0 ? errorDetails : undefined);
      } else if (err?.status === 0 || err?.status === 'FETCH_ERROR') {
        showError('Network error. Please check your connection and try again.');
      } else {
        showError(errorMessage, errorDetails.length > 0 ? errorDetails : undefined);
      }
    }
  };

  const renderContent = () => {
    // Show error state if reason types failed to load
    if (reasonTypesError) {
      return (
        <div className={styles.container}>
          <div className={styles.header}>
            <p className={styles.description}>{finalDescription}</p>
          </div>
          <div className={styles.errorState}>
            <p>Failed to load report reasons.</p>
            <Button
              variant="filled"
              theme="dark"
              size="medium"
              onClick={() => refetchReasonTypes()}
              disabled={reasonTypesLoading}
            >
              Retry
            </Button>
          </div>
          {onCancel && (
            <div className={styles.actions}>
              <Button
                variant="filled"
                theme="light"
                size="large"
                fullWidth
                type="button"
                onClick={onCancel}
              >
                Cancel
              </Button>
            </div>
          )}
        </div>
      );
    }

    // Show loading state
    if (reasonTypesLoading) {
      return (
        <div className={styles.container}>
          <div className={styles.header}>
            <p className={styles.description}>{finalDescription}</p>
          </div>
          <div className={styles.loadingState}>
            <p>Loading report reasons...</p>
          </div>
        </div>
      );
    }

    // Show empty state if no reason types available
    if (!reasonTypes || reasonTypes.length === 0) {
      return (
        <div className={styles.container}>
          <div className={styles.header}>
            <p className={styles.description}>{finalDescription}</p>
          </div>
          <div className={styles.emptyState}>
            <p>No report reasons available for this entity type.</p>
          </div>
          {onCancel && (
            <div className={styles.actions}>
              <Button
                variant="filled"
                theme="light"
                size="large"
                fullWidth
                type="button"
                onClick={onCancel}
              >
                Cancel
              </Button>
            </div>
          )}
        </div>
      );
    }

    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <p className={styles.description}>{finalDescription}</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.reasonsSection}>
            <p className={styles.reasonsHelper}>Select a reason</p>
            <div className={styles.reasonsList}>
              {reasonTypes.map((reason) => (
                <div 
                  key={reason.id} 
                  className={styles.reasonItem}
                >
                  <Radio
                    label={reason.name}
                    checked={selectedReason === reason.id}
                    onChange={(checked) => handleReasonChange(reason.id, checked)}
                    name="reportReason"
                    value={reason.id}
                    disabled={isSubmitting}
                  />
                </div>
              ))}
            </div>
          </div>

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
              loading={isSubmitting}
              disabled={!isValid || selectedReason === null || isSubmitting}
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
  };

  if (isModal) {
    return (
      <Modal isOpen={true} onClose={onCancel || (() => {})}>
        {renderContent()}
      </Modal>
    );
  }

  return renderContent();
};

