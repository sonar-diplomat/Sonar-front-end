import React, { useState } from "react";
import styles from './PasswordRecovery.module.css';
import { Button, LeftArrow } from "@shared/ui";
import { PasswordRecovery as PasswordRecoveryFeature, PasswordRecoveryConfirmation } from "@features/password-recovery";
import { useNavigate } from "react-router-dom";
import { useRequestPasswordChange } from "@features/auth/model/store.ts";

export const PasswordRecovery: React.FC = () => {
    const [showConfirmation, setShowConfirmation] = useState(false);
    const navigate = useNavigate();

    const { loading, error, mutate: requestPasswordChange } = useRequestPasswordChange();

    const handleBack = () => {
        navigate("/login");
    };

    const handlePasswordRecoverySubmit = async () => {
        const res = await requestPasswordChange();
        if (res.success) {
            setShowConfirmation(true);
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
                variant={'dark'}
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
                    error={error}
                />
            )}
        </div>
    );
};
