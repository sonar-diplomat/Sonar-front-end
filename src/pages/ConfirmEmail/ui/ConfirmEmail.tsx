import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useConfirmEmailMutation } from '@features/auth/api/rtkApi';
import { LoadingPlaceholder } from '@shared/ui/LoadingPlaceholder/LoadingPlaceholder';
import { useNotifications } from '@shared/store/notificationStore';
import styles from './ConfirmEmail.module.css';

export const ConfirmEmail: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [confirmEmail, { isLoading, isSuccess, isError, error }] = useConfirmEmailMutation();
  const [hasAttempted, setHasAttempted] = useState(false);
  const { showSuccess, showError } = useNotifications();

  const email = searchParams.get('email');
  const token = searchParams.get('token');

  useEffect(() => {
    if (email && token && !hasAttempted) {
      setHasAttempted(true);
      confirmEmail({ email, token });
    } else if ((!email || !token) && !hasAttempted) {
      setHasAttempted(true);
      showError('The confirmation link is invalid or missing required parameters.');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    }
  }, [email, token, hasAttempted, confirmEmail, showError, navigate]);

  useEffect(() => {
    if (isSuccess) {
      showSuccess('Email successfully confirmed. You can leave this page.');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    }
  }, [isSuccess, showSuccess, navigate]);

  useEffect(() => {
    if (isError) {
      const errorData = error && 'data' in error 
        ? (error.data as { message?: string; errors?: string[]; details?: string[] })
        : null;
      const errorMessage = errorData?.message || 'Failed to confirm email';
      const errorsOrDetails = errorData?.errors || errorData?.details;
      showError(errorMessage, errorsOrDetails);
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    }
  }, [isError, error, showError, navigate]);

  if (isLoading) {
    return (
      <div className={styles.container}>
        <LoadingPlaceholder 
          variant="spinner" 
          text="Confirming your email..."
          fullWidth
        />
      </div>
    );
  }

  return null;
};

