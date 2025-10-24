import React from 'react';
import styles from './Registration.module.css';
import { Button, LeftArrow } from '@shared/ui';
import { RegistrationForm, type RegistrationFormData } from '@features/index.ts';

export const Registration: React.FC = () => {
  const handleRegistrationSubmit = (data: RegistrationFormData) => {
    console.log('Registration submitted:', data);
    // API call
  };

  return (
    <div className={styles.container}>
      <Button icon={<LeftArrow/>} children={'Back'} size={'small'} variant={'dark'}/>
      <RegistrationForm onSubmit={handleRegistrationSubmit} />
    </div>
  );
};
