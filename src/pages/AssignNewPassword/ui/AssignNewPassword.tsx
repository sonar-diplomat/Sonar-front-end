import React from "react";
import styles from './AssignNewPassword.module.css';
import { Button, LeftArrow } from "@shared/ui";
import { AssignNewPassword as AssignNewPasswordFeature } from "@features/password-recovery";
import type { AssignNewPasswordFormData } from "@features/password-recovery";
import { useNavigate } from "react-router-dom";

export const AssignNewPassword: React.FC = () => {
    const navigate = useNavigate();

    const handleBack = () => {
        navigate("/login");
    };

    const handleAssignNewPasswordSubmit = (data: AssignNewPasswordFormData) => {
        // Handle new password assignment
        console.log('New password data:', data);
        // Call API to set new password
        // On success, redirect to login
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

            <AssignNewPasswordFeature
                onSubmit={handleAssignNewPasswordSubmit}
            />
        </div>
    );
};
