import React, { useState } from 'react';
import styles from './Registration.module.css';
import { Button, LeftArrow } from '@shared/ui';
import {
  RegistrationForm,
  PasswordForm,
  EmailConfirmationModal,
  type RegistrationFormData,
  type PasswordFormData
} from '@features/registration'
import type { UserRegisterDTO } from "@features/auth";
import {getBrowserLangCode} from "@shared/lib";
import {useRegister} from "@features/auth/model/store.ts";


type RegistrationStep = 'registration' | 'password' | 'confirmation';



export const Registration: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<RegistrationStep>('registration');

  const [showModal, setShowModal] = useState<boolean>(false);
  const [registerDTO, setRegisterDTO] = useState<Partial<UserRegisterDTO>>({});
  const [registrationData, setRegistrationData] = useState<RegistrationFormData>();
  const { loading, error, mutate } = useRegister();

  const handleRegistrationSubmit = (data: RegistrationFormData) => {
    console.log('Registration submitted:', data);
    setRegisterDTO({
          userName: data.username,
          login: data.login,
          email: data.email,
          firstName: "Linus",
          lastName: "Palamarchuk",
          dateOfBirth: data.dateOfBirth,
          locale: getBrowserLangCode()
      });
    setCurrentStep('password');

  };

  const handlePasswordSubmit = async (data: PasswordFormData) => {
      const dto: UserRegisterDTO = {
          ...(registerDTO as UserRegisterDTO),
          password: data.password,
      };

      setRegisterDTO(dto);

      const res = await mutate(dto);
      console.log('mutate result:', res);

      if (res.success) {
          setCurrentStep('confirmation');
          setShowModal(true);
      } else {
          // тут можно показать ошибку/тост
          console.error('registration failed');
      }
  };

  const handleEmailConfirm = (code: string) => {
    console.log('Email confirmed with code:', code);
    setShowModal(false);

    // Navigate to next page or show success message
  };

  const handleResendCode = () => {
    console.log('Resending verification code to:', registerDTO.email);
    // API call to resend code
  };

  const handleBack = () => {
    if (showModal) {
      setShowModal(false);
      setCurrentStep('password');
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
        <RegistrationForm
            data={registrationData}
            onDataChange={setRegistrationData}
            onSubmit={handleRegistrationSubmit} />
      )}

      {currentStep === 'password' && (
        <PasswordForm onSubmit={handlePasswordSubmit} />
      )}

      {currentStep === 'confirmation' && (
        <EmailConfirmationModal
          email={registerDTO.email || 'user@example.com'}
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onConfirm={handleEmailConfirm}
          onResend={handleResendCode}
        />
      )}
    </div>
  );
};
