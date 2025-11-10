import React, { useState } from "react"
import styles from './Login.module.css';
import {Button, LeftArrow} from "@shared/ui";
import {LoginForm, TwoFactorVerification} from "@features/login";
import type { LoginFormData } from "@features/login";

export const Login: React.FC = () =>{
    const [showTwoFactor, setShowTwoFactor] = useState(false);
    const [userEmail, setUserEmail] = useState('');

    const handleBack = () => {
        // Navigate back logic
        if (showTwoFactor) {
            setShowTwoFactor(false);
        } else {
            window.history.back();
        }
    };

    const handleLoginSubmit = (data: LoginFormData) => {
        // Handle login submission
        console.log('Login data:', data);

        // Simulate 2FA requirement - replace with actual API response
        // If API returns that 2FA is required, show the 2FA screen
        setUserEmail(data.emailOrUsername);
        setShowTwoFactor(true);
    };

    const handleTwoFactorVerify = (code: string) => {
        // Handle 2FA verification
        console.log('2FA code:', code);
        // Send code to backend for verification
        // On success, redirect to dashboard
    };

    const handleTwoFactorResend = () => {
        // Handle resending 2FA code
        console.log('Resend 2FA code to:', userEmail);
        // Call API to resend code
    };

    const handleForgotPassword = () => {
        // Handle forgot password
        console.log('Forgot password clicked');
    };

    const handleContinueWithGoogle = () => {
        // Handle Google login
        console.log('Continue with Google');
    };

    const handleContinueWithApple = () => {
        // Handle Apple login
        console.log('Continue with Apple');
    };

    const handleCreateAccount = () => {
        // Navigate to registration
        console.log('Create account clicked');
    };

    return(
        <div className={styles.container}>
            <Button
                icon={<LeftArrow/>}
                children={'Back'}
                size={'small'}
                variant={'dark'}
                onClick={handleBack}
                className={styles.backButton}
            />

            {showTwoFactor ? (
                <TwoFactorVerification
                    email={userEmail}
                    onVerify={handleTwoFactorVerify}
                    onResend={handleTwoFactorResend}
                />
            ) : (
                <LoginForm
                    onSubmit={handleLoginSubmit}
                    onForgotPassword={handleForgotPassword}
                    onContinueWithGoogle={handleContinueWithGoogle}
                    onContinueWithApple={handleContinueWithApple}
                    onCreateAccount={handleCreateAccount}
                />
            )}
        </div>
    )
}