import React, { useState, useCallback } from 'react';
import styles from './PasswordRecovery.module.css';
import { Button, Input, RightArrow, Form } from '@shared/ui';
import type { PasswordRecoveryFormData, PasswordRecoveryProps } from '../model/types';

export const PasswordRecovery: React.FC<PasswordRecoveryProps> = ({
    onSubmit,
    isSubmitting,
    error,
}) => {
    const [formData, setFormData] = useState<PasswordRecoveryFormData>({
        email: ''
    });

    const updateField = useCallback((field: keyof PasswordRecoveryFormData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    }, []);

    const handleSubmit = useCallback((e: React.FormEvent) => {
        e.preventDefault();
        onSubmit?.(formData);
    }, [formData, onSubmit]);

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h2>Recover password</h2>
                <p>Enter your email to recover password</p>
                {error && <p className={styles.error}>{error}</p>}
            </div>

            <Form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.inputContainer}>
                    <Input
                        label="Email"
                        placeholder="vanessa_sonar@gmail.com"
                        value={formData.email}
                        onChange={(e) => updateField('email', e.target.value)}
                        helperText="Enter the email to the account you linked."
                        required={true}
                    />
                </div>

                <div className={styles.actions}>
                    <Button
                        icon={<RightArrow/>}
                        children={isSubmitting ? "Sending..." : "Continue"}
                        variant={"light"}
                        size={"large"}
                        fullWidth
                        disabled={isSubmitting}
                    />
                </div>
            </Form>
        </div>
    );
};
