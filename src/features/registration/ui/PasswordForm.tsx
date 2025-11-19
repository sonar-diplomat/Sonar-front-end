import React, { useState, useCallback, useMemo } from 'react';
import styles from './PasswordForm.module.css';
import { Button, Input, RightArrow, Info, Checkbox, Form } from '@shared/ui';
import type {FormErrors, PasswordFormData} from "@features/registration/model/types.ts";

const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_VALIDATION_RULES = {
  minLength: (password: string) => password.length >= PASSWORD_MIN_LENGTH,
  hasUpperCase: (password: string) => /[A-Z]/.test(password),
  hasLowerCase: (password: string) => /[a-z]/.test(password),
  hasNumber: (password: string) => /[0-9]/.test(password)
};

const PASSWORD_ERROR_MESSAGES = {
  minLength: `Password must be at least ${PASSWORD_MIN_LENGTH} characters long`,
  hasUpperCase: 'Password must contain at least one uppercase letter',
  hasLowerCase: 'Password must contain at least one lowercase letter',
  hasNumber: 'Password must contain at least one number',
  mismatch: 'Passwords do not match'
};

export interface PasswordFormProps {
  onSubmit?: (data: PasswordFormData) => void;
}

const validatePassword = (password: string): string | undefined => {
  if (!PASSWORD_VALIDATION_RULES.minLength(password)) {
    return PASSWORD_ERROR_MESSAGES.minLength;
  }
  if (!PASSWORD_VALIDATION_RULES.hasUpperCase(password)) {
    return PASSWORD_ERROR_MESSAGES.hasUpperCase;
  }
  if (!PASSWORD_VALIDATION_RULES.hasLowerCase(password)) {
    return PASSWORD_ERROR_MESSAGES.hasLowerCase;
  }
  if (!PASSWORD_VALIDATION_RULES.hasNumber(password)) {
    return PASSWORD_ERROR_MESSAGES.hasNumber;
  }
  return undefined;
};

export const PasswordForm: React.FC<PasswordFormProps> = ({ onSubmit }) => {
  const [isAgreed, setIsAgreed] = useState(false);
  const [formData, setFormData] = useState<PasswordFormData>({
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState<FormErrors>({});

  const handlePasswordChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const password = e.target.value;
    setFormData(prev => ({ ...prev, password }));

    const error = validatePassword(password);
    setErrors(prev => ({ ...prev, password: error }));
  }, []);

  const handleConfirmPasswordChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const confirmPassword = e.target.value;
    setFormData(prev => ({ ...prev, confirmPassword }));

    const error = confirmPassword && confirmPassword !== formData.password
      ? PASSWORD_ERROR_MESSAGES.mismatch
      : undefined;

    setErrors(prev => ({ ...prev, confirmPassword: error }));
  }, [formData.password]);

  const handleSubmit = useCallback(() => {
    if (!isAgreed) {
      alert('Please agree to the terms before continuing');
      return;
    }

    const passwordError = validatePassword(formData.password);
    if (passwordError) {
      setErrors(prev => ({ ...prev, password: passwordError }));
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setErrors(prev => ({ ...prev, confirmPassword: PASSWORD_ERROR_MESSAGES.mismatch }));
      return;
    }

    onSubmit?.(formData);
  }, [isAgreed, formData, onSubmit]);

  const termsLabel = useMemo(() => (
    <>
      By continuing, you agree to the{' '}
      <a href="/terms" className={styles.link}>Terms of Service</a>
    </>
  ), []);

  return (
    <Form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.welcome}>
        <h2>Create password</h2>
        <p>Choose a strong password to secure your account!</p>
      </div>

      <Input
        label="Password"
        placeholder="Enter your password"
        type="password"
        helperText="Password: must be at least 6 characters, including an uppercase letter, a lowercase letter, and a number."
        helperIcon={<Info />}
        value={formData.password}
        onChange={handlePasswordChange}
        error={errors.password}
      />

      <Input
        label="Confirm password"
        placeholder="Re-enter your password"
        type="password"
        value={formData.confirmPassword}
        onChange={handleConfirmPasswordChange}
        error={errors.confirmPassword}
      />

        <div className={styles.submits}>
            <div style={{ marginLeft: '8px' }}>
                <Checkbox checked={isAgreed} onChange={setIsAgreed} label={termsLabel}/>
            </div>
            <Button
                icon={<RightArrow/>}
                variant="light"
                size="large"
                fullWidth
                type="submit"
            >
                Create account
            </Button>
        </div>
    </Form>
  );
};
