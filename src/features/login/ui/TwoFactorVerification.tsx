import React from 'react';

import { CodeVerification,RightArrow } from '@shared/ui';

import type { TwoFactorVerificationProps } from '../model/types';

import styles from './TwoFactorVerification.module.css';

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
          Enter the 6-digit code emailed to the account for{' '}
          <span className={styles.email}>{email}</span>.
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
