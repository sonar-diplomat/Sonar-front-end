import React, {useState, useCallback, useMemo, useEffect} from 'react';
import styles from './RegistrationForm.module.css';
import {Button, Input, RightArrow, Checkbox, Form, DropDown} from '@shared/ui';
import type { RegistrationFormData } from "@features/registration";
import { ModalDatePicker } from "@widgets/ModalDatePicker/ui/ModalDatePicker.tsx";
import {useNotifications} from "@shared/store/notificationStore.tsx";

export interface RegistrationFormProps {
  onSubmit?: (data: RegistrationFormData) => void;
  data?: RegistrationFormData | undefined;
  onDataChange?: (newData: RegistrationFormData) => void;
}

type FormField = keyof RegistrationFormData;

export const RegistrationForm: React.FC<RegistrationFormProps> = ({ onSubmit, data, onDataChange }) => {
  const [isAgreed, setIsAgreed] = useState(false);
  const [formData, setFormData] = useState<RegistrationFormData>(data ?? {
    email: '',
    username: '',
    login: '',
    dateOfBirth: ''
  });
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
    const { showError } = useNotifications();

  const updateField = useCallback((field: FormField, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  useEffect(() => {
        onDataChange?.(formData);
    }, [formData, onDataChange]);

  const handleSubmit = useCallback(() => {
      if (!isAgreed) {
          showError('You must agree to the terms to proceed.');
          return;
      }

    onSubmit?.(formData);
  }, [isAgreed, formData, onSubmit]);
  const consentLabel = useMemo(() => (
    <>
      I consent to the{' '}
      <a href="/terms" className={styles.link}>
        processing and storage of my personal data.
      </a>
    </>
  ), []);

  return (
    <Form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.welcome}>
        <h2>Sign up</h2>
        <p>Fill in the information to create an account and get started!</p>
      </div>

      <Input
        label="Email"
        placeholder="example@sonar.com"
        value={formData.email}
        required={true}
        onChange={(e) => updateField('email', e.target.value)}
      />

      <Input
        label="Username"
        placeholder="Example1234"
        value={formData.username}
        required={true}
        onChange={(e) => updateField('username', e.target.value)}
      />

      <Input
        label="Login"
        placeholder="ExampleLogin"
        value={formData.login}
        required={true}
        onChange={(e) => updateField('login', e.target.value)}
      />

      <Input
        label="Date of birth"
        placeholder="yyyy-mm-dd"
        icon={<DropDown/>}
        iconPosition="prefix"
        iconClickable={true}
        value={formData.dateOfBirth}
        required={true}
        onChange={(e) => updateField('dateOfBirth', e.target.value)}
        onIconClick={()=>{setIsDatePickerOpen(true)}}
        readOnly
      />
      <ModalDatePicker
        isOpen={isDatePickerOpen}
        onClose={() => setIsDatePickerOpen(false)}
        onConfirm={(date) => updateField('dateOfBirth', date)}
        initialValue={formData.dateOfBirth}
      />
      <div className={styles.submits}>
        <Checkbox
          checked={isAgreed}
          onChange={setIsAgreed}
          label={consentLabel}
        />

        <Button
          icon={<RightArrow />}
          variant="filled"
          theme="light"
          size="large"
          fullWidth
          type="submit"
        >
          Continue
        </Button>
      </div>
    </Form>
  );
};