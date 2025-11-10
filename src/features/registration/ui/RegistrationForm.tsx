import React, {useState, useCallback, useMemo, useEffect} from 'react';
import styles from './RegistrationForm.module.css';
import { Button, Input, RightArrow, Info, Checkbox, Form } from '@shared/ui';
import type { RegistrationFormData } from "@features/registration";

const DATE_OPTIONS = [
  { value: 'day', label: 'Day' },
  { value: 'month', label: 'Month' },
  { value: 'year', label: 'Year' }
];



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

  const updateField = useCallback((field: FormField, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  useEffect(() => {
        onDataChange?.(formData);
    }, [formData, onDataChange]);

  const handleSubmit = useCallback(() => {
    if (!isAgreed) {
      alert('Please agree to the terms before continuing');
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
        <p>Fill in the information quickly and create an account to get started!</p>
      </div>

      <Input
        label="Email"
        placeholder="vanessa_sonar@gmail.com"
        value={formData.email}
        onChange={(e) => updateField('email', e.target.value)}
      />

      <Input
        label="Username"
        placeholder="vanessa_ortiz"
        helperText="Why is needed and requirements"
        helperIcon={<Info />}
        value={formData.username}
        onChange={(e) => updateField('username', e.target.value)}
      />

      <Input
        label="Name"
        placeholder="Vanessa"
        helperText="Why is this necessary and requirements"
        helperIcon={<Info />}
        value={formData.login}
        onChange={(e) => updateField('login', e.target.value)}
      />

      <Input
        label="Date of birth"
        placeholder="dd/mm/yy"
        dropdownText="Select"
        dropdownOptions={DATE_OPTIONS}
        iconPosition="prefix"
        value={formData.dateOfBirth}
        onChange={(e) => updateField('dateOfBirth', e.target.value)}
      />

      <div className={styles.submits}>
        <Checkbox
          checked={isAgreed}
          onChange={setIsAgreed}
          label={consentLabel}
        />

        <Button
          icon={<RightArrow />}
          variant="light"
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
