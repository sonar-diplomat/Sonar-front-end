import React,{ useCallback,useState } from 'react';

import { Button,Form,Input,RightArrow } from '@shared/ui';

import type { PasswordRecoveryFormData,PasswordRecoveryProps } from '../model/types';

import styles from './PasswordRecovery.module.css';

export const PasswordRecovery: React.FC<PasswordRecoveryProps> = ({
    onSubmit,
    isSubmitting,
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
            </div>

            <Form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.inputContainer}>
                    <Input
                        label="Email"
                        placeholder="demo@example.test"
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
