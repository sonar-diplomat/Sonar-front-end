import React, { useState, useCallback } from 'react';
import styles from './AssignNewPassword.module.css';
import { Button, Input, RightArrow, Form, EyeIcon, EyeOffIcon } from '@shared/ui';
import type { AssignNewPasswordFormData, AssignNewPasswordProps } from '../model/types';

type FormField = keyof AssignNewPasswordFormData;

export const AssignNewPassword: React.FC<AssignNewPasswordProps> = ({
    onSubmit,
    isSubmitting,
    error,
}) => {
    const [showPassword, setShowPassword] = useState(false);
    const [showRepeatPassword, setShowRepeatPassword] = useState(false);
    const [formData, setFormData] = useState<AssignNewPasswordFormData>({
        password: '',
        repeatPassword: ''
    });

    const updateField = useCallback((field: FormField, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    }, []);

    const handleSubmit = useCallback((e: React.FormEvent) => {
        e.preventDefault();
        onSubmit?.(formData);
    }, [formData, onSubmit]);

    const passwordRequirementsText = "Password: must be at least 6 characters, including an uppercase letter, a lowercase letter, and a number.";

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h2>Assign new password</h2>
                <p>Create a unique complex password that meets our standards.</p>
                {error && <p className={styles.error}>{error}</p>}
            </div>

            <Form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.inputContainer}>
                    <Input
                        label="Password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Vanessa1234"
                        value={formData.password}
                        onChange={(e) => updateField('password', e.target.value)}
                        icon={showPassword ? <EyeIcon/> : <EyeOffIcon/>}
                        onIconClick={() => setShowPassword(!showPassword)}
                        iconPosition={"suffix"}
                        helperText={passwordRequirementsText}
                        required={true}
                    />

                    <Input
                        label="Repeat password"
                        type={showRepeatPassword ? 'text' : 'password'}
                        placeholder="************"
                        value={formData.repeatPassword}
                        onChange={(e) => updateField('repeatPassword', e.target.value)}
                        icon={showRepeatPassword ? <EyeIcon/> : <EyeOffIcon/>}
                        onIconClick={() => setShowRepeatPassword(!showRepeatPassword)}
                        iconPosition={"suffix"}
                        required={true}
                    />
                </div>

                <div className={styles.actions}>
                    <Button
                        icon={<RightArrow/>}
                        children={isSubmitting ? "Saving..." : "Continue"}
                        variant={"filled"}
                        theme={"light"}
                        size={"large"}
                        fullWidth
                        disabled={isSubmitting}
                    />
                </div>
            </Form>
        </div>
    );
};
