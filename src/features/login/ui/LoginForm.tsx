import React, { useState, useCallback } from 'react';
import styles from './LoginForm.module.css';
import {Button, Input, RightArrow, Form, EyeIcon, EyeOffIcon} from '@shared/ui';
import type { LoginFormData, LoginFormProps } from '../model/types';

type FormField = keyof LoginFormData;

export const LoginForm: React.FC<LoginFormProps> = ({ 
    onSubmit, 
    onForgotPassword,
    onContinueWithGoogle,
    onContinueWithApple,
    onCreateAccount 
}) => {
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState<LoginFormData>({
        emailOrUsername: '',
        password: ''
    });

    const updateField = useCallback((field: FormField, value: string) => {
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
                <Input
                    label="Email or Username"
                    placeholder="vanessa_sonar@gmail.com"
                    value={formData.emailOrUsername}
                    onChange={(e) => updateField('emailOrUsername', e.target.value)}
                    helperText="Enter your email or @username"
                />

                <Input
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Vanessa1234"
                    value={formData.password}
                    onChange={(e) => updateField('password', e.target.value)}
                    icon={showPassword ? <EyeIcon/> : <EyeOffIcon/>}
                    onIconClick={() => setShowPassword(!showPassword)}
                    iconPosition={"suffix"}
                    helperText={"Forgot Password?"}
                    helperTextAction={{
                        text: 'Recover',
                        onClick: () => onForgotPassword,
                    }}
                />
                <div className={styles.submits}>
                    <Button icon={<RightArrow/>} children={"Continue"} variant={"light"} size={"large"}
                            fullWidth/>
                    <Button icon={<RightArrow/>} children={"Continue with Google"} variant={"dark"} size={"large"}
                            onClick={onContinueWithGoogle}
                            fullWidth/>
                    <Button icon={<RightArrow/>} children={"Continue with Apple"} variant={"dark"} size={"large"}
                            onClick={onContinueWithApple}
                            fullWidth/>
                    <button
                        type="button"
                        className={styles.createAccount}
                        onClick={onCreateAccount}
                    >
                        Create account in one touch
                    </button>
                </div>
            </Form>
        </div>
);
};
