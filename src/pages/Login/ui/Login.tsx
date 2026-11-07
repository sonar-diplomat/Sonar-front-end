import React,{ useCallback,useEffect,useRef,useState } from "react";

import { useNavigate } from "react-router-dom";

import { useLogin,useVerify2FA } from "@features/auth/model/store.ts";
import type { LoginResponseDTO,TwoFactorChallengeDTO } from "@features/auth/model/types";
import type { LoginFormData } from "@features/login";
import { LoginForm,TwoFactorVerification } from "@features/login";
import { isDemoMode } from '@shared/config/data-source';
import { setCredentials } from '@shared/store/features/auth/authSlice';
import { useAppDispatch } from '@shared/store/hooks';
import { useNotifications } from "@shared/store/notificationStore";
import { Button,LeftArrow } from "@shared/ui";

import styles from './Login.module.css';

export const Login: React.FC = () =>{
    const [challenge, setChallenge] = useState<(TwoFactorChallengeDTO & { identifier: string; deviceName: string }) | null>(null);
    const pending = useRef<AbortController | null>(null);
    const navigate = useNavigate();
    const dispatch = useAppDispatch();

    const { loading: loginLoading, mutate: login } = useLogin();
    const { loading: verifyLoading, mutate: verify2FA } = useVerify2FA();
    const { showSuccess, showError } = useNotifications();

    const cancelAttempt = useCallback(() => {
        pending.current?.abort();
        pending.current = null;
    }, []);

    useEffect(() => cancelAttempt, [cancelAttempt]);

    useEffect(() => {
        if (!challenge) return;
        const timer = setTimeout(() => {
            cancelAttempt();
            setChallenge(null);
            showError('Verification expired. Sign in again to request a new code.');
        }, Math.max(0, Date.parse(challenge.expiresAt) - Date.now()));
        return () => clearTimeout(timer);
    }, [cancelAttempt, challenge, showError]);

    const startAttempt = () => {
        cancelAttempt();
        const controller = new AbortController();
        pending.current = controller;
        return controller;
    };

    const clearChallenge = () => {
        cancelAttempt();
        setChallenge(null);
    };

    const handleBack = () => {
        clearChallenge();
        if (!challenge) navigate("/entry");
    };

    const completeLogin = (credentials: LoginResponseDTO) => {
        clearChallenge();
        dispatch(setCredentials(credentials));
        showSuccess('Login successful!');
        navigate('/home');
    };

    const handleLoginSubmit = async (data: LoginFormData) => {
        const attempt = startAttempt();
        setChallenge(null);
        const deviceName = window.navigator.userAgent || "web";
        const res = await login(data.emailOrLogin, data.password, deviceName, attempt.signal);
        if (pending.current !== attempt) return;
        pending.current = null;

        if (!res.success) {
            showError(res.message || 'Login failed', res.errors || res.details);
            return;
        }

        if (!res.data) {
            showError('Login did not return credentials or a verification challenge.');
        } else if ('requiresTwoFactor' in res.data) {
            const expiresAt = Date.parse(res.data.expiresAt);
            if (!res.data.challengeToken || !Number.isFinite(expiresAt) || expiresAt <= Date.now()) {
                showError('Verification expired. Sign in again to request a new code.');
                return;
            }
            setChallenge({ ...res.data, identifier: data.emailOrLogin, deviceName });
        } else {
            completeLogin(res.data);
        }
    };

    const handleTwoFactorVerify = async (code: string) => {
        if (!challenge || !/^\d{6}$/.test(code)) return;
        if (Date.parse(challenge.expiresAt) <= Date.now()) {
            clearChallenge();
            showError('Verification expired. Sign in again to request a new code.');
            return;
        }
        const attempt = startAttempt();
        const res = await verify2FA({ challengeToken: challenge.challengeToken, code }, challenge.deviceName, attempt.signal);
        if (pending.current !== attempt) return;
        pending.current = null;
        if (res.success && res.data) {
            completeLogin(res.data);
        } else {
            showError(res.message || '2FA verification failed', res.errors || res.details);
        }
    };

    const handleTwoFactorResend = () => {
        clearChallenge();
        showError('Sign in again to request a new code.');
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
            {challenge ? (
                <TwoFactorVerification
                    email={challenge.identifier}
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
