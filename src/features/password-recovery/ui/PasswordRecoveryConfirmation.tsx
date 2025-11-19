import React from 'react';
import styles from './PasswordRecoveryConfirmation.module.css';
import { Button } from '@shared/ui';

export interface PasswordRecoveryConfirmationProps {
    onBackToLogin?: () => void;
}

export const PasswordRecoveryConfirmation: React.FC<PasswordRecoveryConfirmationProps> = ({
    onBackToLogin
}) => {
    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h2>Please confirm your password recover</h2>
                <p>We have sent a letter to your email address with a request to reset your password.</p>
            </div>

            <div className={styles.actions}>
                <Button
                    children={"Back to Login"}
                    variant={"light"}
                    size={"large"}
                    onClick={onBackToLogin}
                    fullWidth
                />
            </div>
        </div>
    );
};
