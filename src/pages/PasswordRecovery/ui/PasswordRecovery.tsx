import React,{ useState } from "react";

import { useNavigate } from "react-router-dom";

import { useForgotPassword } from "@features/auth/model/store.ts";
import type { PasswordRecoveryFormData } from "@features/password-recovery";
import { PasswordRecoveryConfirmation,PasswordRecovery as PasswordRecoveryFeature } from "@features/password-recovery";
import { isDemoMode } from '@shared/config/data-source';
import { useNotifications } from "@shared/store/notificationStore";
import { Button,LeftArrow } from "@shared/ui";

import styles from './PasswordRecovery.module.css';

export const PasswordRecovery: React.FC = () => {
    const [showConfirmation, setShowConfirmation] = useState(false);
    const navigate = useNavigate();
    const [email, setEmail] = useState('');

    const { loading, mutate: forgotPassword } = useForgotPassword();
    const { showSuccess, showError } = useNotifications();

    const handleBack = () => {
        navigate("/login");
    };

    const handlePasswordRecoverySubmit = async (data: PasswordRecoveryFormData) => {
        const res = await forgotPassword({ Email: data.email });
        if (res.success) {
            setEmail(data.email);
            showSuccess(isDemoMode ? 'Local reset link created in the demo inbox.' : 'Password recovery email sent! Please check your email.');
            setShowConfirmation(true);
        } else {
            showError(res.message || 'Failed to send password recovery email', res.errors || res.details);
        }
    };

    const handleBackToLogin = () => {
        navigate("/login");
    };

    return (
        <div className={styles.container}>
            <Button
                icon={<LeftArrow/>}
                children={'Back'}
                size={'small'}
                variant={'filled'}
                theme={'dark'}
                onClick={handleBack}
                className={styles.backButton}
            />

            {isDemoMode && <p>Demo recovery creates a local inbox link. No email is sent.</p>}
            {showConfirmation ? (
                <PasswordRecoveryConfirmation
                    email={email} onBackToLogin={handleBackToLogin}
                />
            ) : (
                <PasswordRecoveryFeature
                    onSubmit={handlePasswordRecoverySubmit}
                    isSubmitting={loading}
                />
            )}
        </div>
    );
};
