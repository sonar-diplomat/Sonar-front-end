import React from "react"
import styles from './Login.module.css';
import {Button, LeftArrow} from "@shared/ui";
import {LoginForm} from "@features/login";
import type { LoginFormData } from "@features/login";

export const Login: React.FC = () =>{
    const handleBack = () => {
        // Navigate back logic
        window.history.back();
    };

    const handleLoginSubmit = (data: LoginFormData) => {
        // Handle login submission
        console.log('Login data:', data);
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

            <LoginForm 
                onSubmit={handleLoginSubmit}
                onForgotPassword={handleForgotPassword}
                onContinueWithGoogle={handleContinueWithGoogle}
                onContinueWithApple={handleContinueWithApple}
                onCreateAccount={handleCreateAccount}
            />
        </div>
    )
}