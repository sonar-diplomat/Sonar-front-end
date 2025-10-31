import React, { useState } from 'react';
import styles from './Registration.module.css';
import { Button, LeftArrow } from '@shared/ui';
import {
  RegistrationForm,
  PasswordForm,
  EmailConfirmationModal,
  type RegistrationFormData,
  type PasswordFormData
} from '@features/registration';

type RegistrationStep = 'registration' | 'password' | 'confirmation';

export const Registration: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<RegistrationStep>('registration');
  const [email, setEmail] = useState<string>('');
  const [showModal, setShowModal] = useState<boolean>(false);

  const handleRegistrationSubmit = (data: RegistrationFormData) => {
    console.log('Registration submitted:', data);
    setEmail(data.email);
    setCurrentStep('password');
  };

  const handlePasswordSubmit = (data: PasswordFormData) => {
    console.log('Password submitted:', data);
    setCurrentStep('confirmation');
    setShowModal(true);
  };

  const handleEmailConfirm = (code: string) => {
    console.log('Email confirmed with code:', code);
    setShowModal(false);
    // Navigate to next page or show success message
  };

  const handleResendCode = () => {
    console.log('Resending verification code to:', email);
    // API call to resend code
  };

  const handleBack = () => {
    if (showModal) {
      setShowModal(false);
      return;
    }

    if (currentStep === 'password') {
      setCurrentStep('registration');
    } else if (currentStep === 'confirmation') {
      setCurrentStep('password');
      setShowModal(false);
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
        <EmailConfirmationModal
          email={email || 'user@example.com'}
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onConfirm={handleEmailConfirm}
          onResend={handleResendCode}
        />
      )}
    </div>
  );
};
