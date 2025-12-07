import React, { useState } from "react";
import styles from './PasswordRecovery.module.css';
import { Button, LeftArrow } from "@shared/ui";
import { PasswordRecovery as PasswordRecoveryFeature, PasswordRecoveryConfirmation } from "@features/password-recovery";
import type { PasswordRecoveryFormData } from "@features/password-recovery";
import { useNavigate } from "react-router-dom";
import { useForgotPassword } from "@features/auth/model/store.ts";
import { useNotifications } from "@shared/store/notificationStore";

export const PasswordRecovery: React.FC = () => {
    const [showConfirmation, setShowConfirmation] = useState(false);
    const navigate = useNavigate();

    const { loading, mutate: forgotPassword } = useForgotPassword();
    const { showSuccess, showError } = useNotifications();

    const handleBack = () => {
        navigate("/login");
    };

    const handlePasswordRecoverySubmit = async (data: PasswordRecoveryFormData) => {
        const res = await forgotPassword({ Email: data.email });
        if (res.success) {
            showSuccess('Password recovery email sent! Please check your email.');
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

            {showConfirmation ? (
                <PasswordRecoveryConfirmation
                    onBackToLogin={handleBackToLogin}
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
