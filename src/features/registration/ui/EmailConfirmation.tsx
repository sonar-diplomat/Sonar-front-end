import React from 'react';
import { CodeVerification, RightArrow } from '@shared/ui';
import styles from './EmailConfirmation.module.css';

export interface EmailConfirmationModalProps {
  email: string;
  onConfirm: (code: string) => void;
  onResend?: () => void;
}

export const EmailConfirmation: React.FC<EmailConfirmationModalProps> = ({
  email,
  onConfirm,
  onResend
}) => {
  return (
    <CodeVerification
      title="Confirm E-mail"
      description={
        <>
          Enter the 6-digit code you received via email at{' '}
          <span className={styles.email}>{email}</span> to verify your account.
        </>
      }
      buttonText="Confirm"
      buttonIcon={<RightArrow />}
      onConfirm={onConfirm}
      onResend={onResend}
    />
  );
};
