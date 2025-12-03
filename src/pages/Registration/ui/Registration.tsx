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
import { useRegister } from "@features/auth/model/store.ts";
import type { UserRegisterDTO } from "@features/auth";
import { useNotifications } from "@shared/store/notificationStore";

type RegistrationStep = 'registration' | 'password' | 'confirmation';

export const Registration: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<RegistrationStep>('registration');
  const [email, setEmail] = useState<string>('');
  const [registrationData, setRegistrationData] = useState<RegistrationFormData | undefined>(undefined);
  const navigate = useNavigate();

  const { mutate: register } = useRegister();
  const { showSuccess, showError } = useNotifications();

  const handleRegistrationSubmit = (data: RegistrationFormData) => {
    setEmail(data.email);
    setRegistrationData(data);
    setCurrentStep('password');
  };

  const handlePasswordSubmit = async (data: PasswordFormData) => {
    if (!registrationData) return;

    const dto: UserRegisterDTO = {
      Username: registrationData.username,
      Login: registrationData.login,
      Email: registrationData.email,
      Password: data.password,
      FirstName: registrationData.username,
      LastName: registrationData.username,
      DateOfBirth: registrationData.dateOfBirth,
      Locale: navigator.language || 'en-US',
    };

    const res = await register(dto);

    if (res.success) {
      showSuccess('Registration successful! Please check your email for verification.');
      setCurrentStep('confirmation');
    } else {
      showError(res.message || 'Registration failed', res.status);
    }
  };

  const handleEmailConfirm = (code: string) => {
    console.log('Email confirmed with code:', code);
    navigate('/login');
  };

  const handleResendCode = () => {
    console.log('Resending verification code to:', email);
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
        variant={'filled'}
        theme={'dark'}
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
          email={email}
          onConfirm={handleEmailConfirm}
          onResend={handleResendCode}
        />
      )}
    </div>
  );
};
