import React, { useState } from 'react';
import styles from './ReportProblem.module.css';
import { Input, Select, Button, Checkbox } from '@shared/ui';
import { ProfileHeader } from '@widgets/ProfileHeader';
import {
  useCreateReportMutation,
  useGetReportReasonTypesQuery,
  useGetReportEntityTypesQuery,
} from '@shared/api';
import type { CreateReportDTO } from '@entities/Report';

export const ReportProblem: React.FC = () => {
  const [createReport, { isLoading: isSubmitting }] = useCreateReportMutation();
  const { data: reasonTypes, isLoading: reasonTypesLoading } = useGetReportReasonTypesQuery();
  const { data: entityTypes, isLoading: entityTypesLoading } = useGetReportEntityTypesQuery();

  const [entityIdentifier, setEntityIdentifier] = useState('');
  const [entityTypeId, setEntityTypeId] = useState<number | undefined>(undefined);
  const [selectedReasons, setSelectedReasons] = useState<number[]>([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const entityTypeOptions = entityTypes?.map(type => ({
    value: type.id,
    label: type.name,
  })) || [];

  const handleReasonToggle = (reasonId: number, checked: boolean) => {
    if (checked) {
      setSelectedReasons(prev => [...prev, reasonId]);
    } else {
      setSelectedReasons(prev => prev.filter(id => id !== reasonId));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!entityIdentifier.trim()) {
      setError('Entity ID is required');
      return;
    }

    if (!entityTypeId) {
      setError('Please select an entity type');
      return;
    }

    if (selectedReasons.length === 0) {
      setError('Please select at least one reason');
      return;
    }

    const entityId = parseInt(entityIdentifier, 10);
    if (isNaN(entityId) || entityId <= 0) {
      setError('Entity ID must be a valid positive number');
      return;
    }

    try {
      const dto: CreateReportDTO = {
        entityIdentifier: entityId,
        reportableEntityTypeId: entityTypeId,
        reportReasonTypeIds: selectedReasons,
      };

      await createReport(dto).unwrap();
      setSuccess(true);
      setEntityIdentifier('');
      setEntityTypeId(undefined);
      setSelectedReasons([]);
    } catch (err: any) {
      setError(err?.data?.message || 'Failed to submit report. Please try again.');
    }
  };

  return (
    <div className={styles.container}>
      <ProfileHeader title="Report a Problem" showBackButton />
      
      <div className={styles.content}>
        <p className={styles.description}>
          Report inappropriate content or users om the platform.
        </p>

        <form onSubmit={handleSubmit} className={styles.form}>
          <Input
            label="Entity ID"
            placeholder="Enter the ID of the item to report"
            value={entityIdentifier}
            onChange={(e) => setEntityIdentifier(e.target.value)}
            required
            helperText="The ID of the user, track, playlist, album, etc. you're reporting"
          />

          <Select
            label="Entity Type"
            placeholder="Select what you're reporting"
            options={entityTypeOptions}
            value={entityTypeId}
            onChange={(value) => setEntityTypeId(Number(value))}
          />

          {reasonTypes && reasonTypes.length > 0 && (
            <div className={styles.reasonsSection}>
              <label className={styles.reasonsLabel}>Reason(s) for Report *</label>
              <p className={styles.reasonsHelper}>Select all that apply</p>
              <div className={styles.reasonsList}>
                {reasonTypes.map((reason) => (
                  <Checkbox
                    key={reason.id}
                    label={reason.name}
                    checked={selectedReasons.includes(reason.id)}
                    onChange={(checked) => handleReasonToggle(reason.id, checked)}
                  />
                ))}
              </div>
            </div>
          )}

          <Button
            variant="dark"
            size="large"
            fullWidth
            type="submit"
            loading={isSubmitting || reasonTypesLoading || entityTypesLoading}
            disabled={!entityTypes || !reasonTypes}
          >
            Submit Report
          </Button>
        </form>

        <div className={styles.helpText}>
          <p>Need immediate help?</p>
          <p className={styles.helpSubtext}>
            Contact our support team at support@sonar.com
          </p>
        </div>
      </div>
    </div>
  );
};

