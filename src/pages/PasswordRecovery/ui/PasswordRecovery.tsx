import React, { useState } from "react";
import styles from './PasswordRecovery.module.css';
import { Button, LeftArrow } from "@shared/ui";
import { PasswordRecovery as PasswordRecoveryFeature, PasswordRecoveryConfirmation } from "@features/password-recovery";
import type { PasswordRecoveryFormData } from "@features/password-recovery";
import { useNavigate } from "react-router-dom";

export const PasswordRecovery: React.FC = () => {
    const [showConfirmation, setShowConfirmation] = useState(false);
    const navigate = useNavigate();

    const handleBack = () => {
        navigate("/login");
    };

    const handlePasswordRecoverySubmit = (data: PasswordRecoveryFormData) => {
        // Handle password recovery submission
        console.log('Password recovery email:', data.email);
        // Call API to send password recovery email
        // On success, show confirmation
        setShowConfirmation(true);
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
                />
            )}
        </div>
    );
};
