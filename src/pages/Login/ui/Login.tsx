import React, { useState } from "react"
import styles from './Login.module.css';
import {Button, LeftArrow} from "@shared/ui";
import {LoginForm, TwoFactorVerification} from "@features/login";
import type { LoginFormData } from "@features/login";
import {useNavigate} from "react-router-dom";
import { useLogin, useVerify2FA } from "@features/auth/model/store.ts";
import { authManager } from "@shared/lib/auth/auth-manager";
import { useNotifications } from "@shared/store/notificationStore";

export const Login: React.FC = () =>{
    const [showTwoFactor, setShowTwoFactor] = useState(false);
    const [userEmail, setUserEmail] = useState('');
    const navigate = useNavigate();

    const { loading: loginLoading, mutate: login } = useLogin();
    const { loading: verifyLoading, mutate: verify2FA } = useVerify2FA();
    const { showSuccess, showError } = useNotifications();

    const handleBack = () => {
        // Navigate back logic
        if (showTwoFactor) {
            setShowTwoFactor(false);
        } else {
            navigate("/entry");
        }
    };

    const handleLoginSubmit = async (data: LoginFormData) => {
        const deviceName = window.navigator.userAgent || "web";
        const res = await login(data.emailOrLogin, data.password, deviceName);

        if (!res.success) {
            showError(res.message || 'Login failed', res.errors || res.details);
            return;
        }

        if (res.data) {
            showSuccess('Login successful!');
            navigate("/hello");
        } else {
            setUserEmail(data.emailOrLogin);
            setShowTwoFactor(true);
        }
    };

    const handleTwoFactorVerify = async (code: string) => {
        if (!userEmail) return;

        const deviceName = window.navigator.userAgent || "web";
        const res = await verify2FA({ Email: userEmail, Code: code }, deviceName);

        if (res.success && res.data) {
            showSuccess('Two-factor authentication successful!');
            navigate("/hello");
        } else {
            showError(res.message || '2FA verification failed', res.errors || res.details);
        }
    };

    const handleTwoFactorResend = () => {
        console.log('Resend 2FA code to:', userEmail);
    };

    const handleForgotPassword = () => {
        navigate("/password-recovery");
    };

    const handleContinueWithGoogle = () => {
        console.log('Continue with Google');
    };

    const handleContinueWithApple = () => {
        console.log('Continue with Apple');
    };

    const handleCreateAccount = () => {
        navigate("/register");
    };

    return(
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

            {showTwoFactor ? (
                <TwoFactorVerification
                    email={userEmail}
                    onVerify={handleTwoFactorVerify}
                    onResend={handleTwoFactorResend}
                    isSubmitting={verifyLoading}
                />
            ) : (
                <LoginForm
                    onSubmit={handleLoginSubmit}
                    onForgotPassword={handleForgotPassword}
                    onContinueWithGoogle={handleContinueWithGoogle}
                    onContinueWithApple={handleContinueWithApple}
                    onCreateAccount={handleCreateAccount}
                    isSubmitting={loginLoading}
                />
            )}
        </div>
    )
}