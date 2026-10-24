import React,{ useState } from "react";

import { useNavigate } from "react-router-dom";

import { useLogin,useVerify2FA } from "@features/auth/model/store.ts";
import type { LoginFormData } from "@features/login";
import { LoginForm,TwoFactorVerification } from "@features/login";
import { isDemoMode } from '@shared/config/data-source';
import { useNotifications } from "@shared/store/notificationStore";
import { Button,LeftArrow } from "@shared/ui";

import styles from './Login.module.css';

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
            navigate("/home");
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
            navigate("/home");
        } else {
            showError(res.message || '2FA verification failed', res.errors || res.details);
        }
    };

    const handleTwoFactorResend = () => {
        showError('Code resend is unavailable in this client.');
    };

    const handleForgotPassword = () => {
        navigate("/password-recovery");
    };

    const handleContinueWithGoogle = () => {
        showError('Google sign-in is unavailable in this client.');
    };

    const handleContinueWithApple = () => {
        showError('Apple sign-in is unavailable in this client.');
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

            {isDemoMode && <><p>Demo accounts stay in this browser. Use fictional credentials.</p><Button onClick={() => { void import('@demo-runtime').then(runtime => runtime.enterDemoSession()).then(() => navigate('/home')); }}>Continue demo as guest</Button></>}
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
