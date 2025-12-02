import React from "react";
import styles from './AssignNewPassword.module.css';
import { Button, LeftArrow } from "@shared/ui";
import { AssignNewPassword as AssignNewPasswordFeature } from "@features/password-recovery";
import type { AssignNewPasswordFormData } from "@features/password-recovery";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useConfirmPasswordChange } from "@features/auth/model/store.ts";
import { useNotifications } from "@shared/store/notificationStore";

export const AssignNewPassword: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { loading, mutate: confirmPasswordChange } = useConfirmPasswordChange();
    const { showSuccess, showError } = useNotifications();

    const handleBack = () => {
        navigate("/login");
    };

    const handleAssignNewPasswordSubmit = async (data: AssignNewPasswordFormData) => {
        const token = searchParams.get('token') || '';

        const res = await confirmPasswordChange({
            Token: token,
            NewPassword: data.password,
            OldPassword: '',
        });

        if (res.success) {
            showSuccess('Password updated successfully!');
            navigate("/login");
        } else {
            showError(res.message || 'Failed to update password', res.status);
        }
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

            <AssignNewPasswordFeature
                onSubmit={handleAssignNewPasswordSubmit}
                isSubmitting={loading}
            />
        </div>
    );
};
