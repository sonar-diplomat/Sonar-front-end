import React from "react";

import { useNavigate,useSearchParams } from "react-router-dom";

import { useResetPassword } from "@features/auth/model/store.ts";
import type { AssignNewPasswordFormData } from "@features/password-recovery";
import { AssignNewPassword as AssignNewPasswordFeature } from "@features/password-recovery";
import { useNotifications } from "@shared/store/notificationStore";
import { Button,LeftArrow } from "@shared/ui";

import styles from './AssignNewPassword.module.css';

export const AssignNewPassword: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { loading, mutate: resetPassword } = useResetPassword();
    const { showSuccess, showError } = useNotifications();

    const handleBack = () => {
        navigate("/login");
    };

    const handleAssignNewPasswordSubmit = async (data: AssignNewPasswordFormData) => {
        const token = searchParams.get('token') || '';
        const email = searchParams.get('email') || '';

        if (!token || !email) {
            showError('Missing required parameters', ['Token and email are required in the URL']);
            return;
        }

        if (data.password !== data.repeatPassword) {
            showError('Passwords do not match', ['Please make sure both passwords are the same']);
            return;
        }

        const res = await resetPassword({
            Email: email,
            Token: token,
            NewPassword: data.password,
        });

        if (res.success) {
            showSuccess('Password updated successfully!');
            navigate("/login");
        } else {
            showError(res.message || 'Failed to update password', res.errors || res.details);
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
