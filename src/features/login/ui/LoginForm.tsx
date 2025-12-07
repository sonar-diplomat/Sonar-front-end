import React, { useState, useCallback } from 'react';
import styles from './LoginForm.module.css';
import {Button, Input, RightArrow, Form, EyeIcon, EyeOffIcon, GoogleIcon, AppleIcon} from '@shared/ui';
import type { LoginFormData, LoginFormProps } from '../model/types';

export const LoginForm: React.FC<LoginFormProps> = ({
    onSubmit, 
    onForgotPassword,
    onContinueWithGoogle,
    onContinueWithApple,
    onCreateAccount,
    isSubmitting,
}) => {
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState<LoginFormData>({
        emailOrLogin: '',
        password: ''
    });

    const updateField = useCallback((field: keyof LoginFormData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    }, []);

    const handleSubmit = useCallback((e: React.FormEvent) => {
        e.preventDefault();
        onSubmit?.(formData);
    }, [formData, onSubmit]);

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h2>Sign in</h2>
                <p>Enter your details to log in!</p>
            </div>

            <Form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.inputContainer}>
                    <Input
                        label="Email or Login"
                        placeholder="example@sonar.com"
                        value={formData.emailOrLogin}
                        onChange={(e) => updateField('emailOrLogin', e.target.value)}
                        required={true}
                    />

                    <Input
                        label="Password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Example1234"
                        value={formData.password}
                        onChange={(e) => updateField('password', e.target.value)}
                        icon={showPassword ? <EyeIcon/> : <EyeOffIcon/>}
                        onIconClick={() => setShowPassword(!showPassword)}
                        iconPosition={"suffix"}
                        iconClickable={true}
                        helperText={"Forgot Password?"}
                        required={true}
                        {...(onForgotPassword && {
                            helperTextAction: {
                                text: 'Recover',
                                onClick: onForgotPassword,
                            }
                        })}
                    />
                </div>

                <div className={styles.actions}>
                    <div className={styles.submits}>
                        <Button
                            icon={<RightArrow/>}
                            children={"Continue"}
                            variant={"filled"}
                            theme={"light"}
                            size={"large"}
                            fullWidth
                            disabled={isSubmitting}
                        />
                        <Button icon={<GoogleIcon/>} children={"Continue with Google"} variant={"filled"} theme={"dark"} size={"large"}
                                onClick={onContinueWithGoogle}
                                fullWidth
                                className={styles.hiddenButton}/>
                        <Button icon={<AppleIcon/>} children={"Continue with Apple"} variant={"filled"} theme={"dark"} size={"large"}
                                onClick={onContinueWithApple}
                                fullWidth
                                className={styles.hiddenButton}/>
                    </div>
                    <button
                        type="button"
                        className={styles.createAccount}
                        onClick={onCreateAccount}
                    >
                        Create an account
                    </button>
                </div>
            </Form>
        </div>
    );
};
