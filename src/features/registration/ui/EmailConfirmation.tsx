import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@shared/ui';
import styles from './EmailConfirmation.module.css';

export interface EmailConfirmationModalProps {
  email?: string;
  onConfirm?: (code: string) => void;
  onResend?: () => void;
}

export const EmailConfirmation: React.FC<EmailConfirmationModalProps> = () => {
  const navigate = useNavigate();

  const handleOk = () => {
    navigate('/login');
  };

  return (
    <div className={styles.container}>
      <div className={styles.message}>
        <h2 className={styles.title}>Check your email</h2>
        <p className={styles.description}>
          Please check your email to activate your account.
        </p>
        <Button
          variant="filled"
          theme="light"
          size="large"
          shape="cr-20"
          onClick={handleOk}
          className={styles.button}
        >
          Ок
        </Button>
      </div>
    </div>
  );
};
