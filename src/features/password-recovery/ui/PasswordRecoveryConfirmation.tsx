import React from 'react';

import { isDemoMode } from '@shared/config/data-source';
import { Button } from '@shared/ui';
import { DemoOutboxNotice } from '@shared/ui/DemoOutboxNotice';


import styles from './PasswordRecoveryConfirmation.module.css';

export interface PasswordRecoveryConfirmationProps {
    email?: string;
    onBackToLogin?: () => void;
}

export const PasswordRecoveryConfirmation: React.FC<PasswordRecoveryConfirmationProps> = ({
    email = '', onBackToLogin
}) => {
    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h2>Please confirm your password recover</h2>
                <p>{isDemoMode ? 'Use the local demo link below. No real email is sent.' : 'We have sent a letter to your email address with a request to reset your password.'}</p>
            </div>

            {isDemoMode && <DemoOutboxNotice kind="reset-password" email={email} />}
            <div className={styles.actions}>
                <Button
                    children={"Back to Login"}
                    variant="filled"
                    theme="light"
                    size={"large"}
                    onClick={onBackToLogin}
                    fullWidth
                />
            </div>
        </div>
    );
};
