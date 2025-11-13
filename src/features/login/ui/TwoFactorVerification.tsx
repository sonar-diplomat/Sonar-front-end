import React from 'react';
import { CodeVerification, RightArrow } from '@shared/ui';
import styles from './TwoFactorVerification.module.css';

export interface TwoFactorVerificationProps {
  email: string;
  onVerify: (code: string) => void;
  onResend?: () => void;
}

export const TwoFactorVerification: React.FC<TwoFactorVerificationProps> = ({
  email,
  onVerify,
  onResend
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
      buttonText="Sign in"
      buttonIcon={<RightArrow />}
      onConfirm={onVerify}
      onResend={onResend}
    />
  );
};