import React, { useState } from 'react';
import styles from './Registration.module.css';
import { Button, LeftArrow } from '@shared/ui';
import {
  RegistrationForm,
  PasswordForm,
  EmailConfirmation,
  type RegistrationFormData,
  type PasswordFormData
} from '@features/registration';
import {useNavigate} from "react-router-dom";

type RegistrationStep = 'registration' | 'password' | 'confirmation';

export const Registration: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<RegistrationStep>('registration');
  const [email, setEmail] = useState<string>('');
    const navigate = useNavigate();

  const handleRegistrationSubmit = (data: RegistrationFormData) => {
    console.log('Registration submitted:', data);
    setEmail(data.email);
    setCurrentStep('password');
  };

  const handlePasswordSubmit = (data: PasswordFormData) => {
    console.log('Password submitted:', data);
    setCurrentStep('confirmation');
  };

  const handleEmailConfirm = (code: string) => {
    console.log('Email confirmed with code:', code);
    // Navigate to next page or show success message
  };

  const handleResendCode = () => {
    console.log('Resending verification code to:', email);
    // API call to resend code
  };

  const handleBack = () => {
    if (currentStep === 'registration') {
      navigate('/entry');
    }
    else if (currentStep === 'password') {
      setCurrentStep('registration');
    } else if (currentStep === 'confirmation') {
      setCurrentStep('password');
    }
  };
  return (
    <div className={styles.container}>
      <Button
        icon={<LeftArrow/>}
        children={'Back'}
        size={'small'}
        variant={'dark'}
        onClick={handleBack}
      />

      {currentStep === 'registration' && (
        <RegistrationForm onSubmit={handleRegistrationSubmit} />
      )}

      {currentStep === 'password' && (
        <PasswordForm onSubmit={handlePasswordSubmit} />
      )}

      {currentStep === 'confirmation' && (
        <EmailConfirmation
          email={email || 'user@example.com'}
          onConfirm={handleEmailConfirm}
          onResend={handleResendCode}
        />
      )}
    </div>
  );
};
