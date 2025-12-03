import React from 'react';
import { CodeVerification, RightArrow } from '@shared/ui';
import styles from './TwoFactorVerification.module.css';
import type { TwoFactorVerificationProps } from '../model/types';

export const TwoFactorVerification: React.FC<TwoFactorVerificationProps> = ({
  email,
  onVerify,
  onResend,
  isSubmitting,
}) => {
  return (
    <CodeVerification
      title="Verify code"
      description={
        <>
          Enter the 6-digit code you received via email at{' '}
          <span className={styles.email}>{email}</span> to verify your account.
        </>
      }
      buttonText={isSubmitting ? "Signing in..." : "Sign in"}
      buttonIcon={<RightArrow />}
      onConfirm={onVerify}
      onResend={onResend}
      disabled={isSubmitting}
    />
  );
};