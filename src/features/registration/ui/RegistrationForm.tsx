import React, { useState } from 'react';
import styles from './RegistrationForm.module.css';
import { Button, Input, RightArrow, Info, Checkbox, Form } from '@shared/ui';

export interface RegistrationFormData {
  email: string;
  username: string;
  name: string;
  dateOfBirth: string;
}

export interface RegistrationFormProps {
  onSubmit?: (data: RegistrationFormData) => void;
}

export const RegistrationForm: React.FC<RegistrationFormProps> = ({ onSubmit }) => {
  const [isAgreed, setIsAgreed] = useState(false);
  const [formData, setFormData] = useState<RegistrationFormData>({
    email: '',
    username: '',
    name: '',
    dateOfBirth: ''
  });

  const dateOptions = [
    { value: 'day', label: 'Day' },
    { value: 'month', label: 'Month' },
    { value: 'year', label: 'Year' },
  ];

  const handleSubmit = () => {
    if (!isAgreed) {
      alert('Please agree to the terms before continuing');
      return;
    }

    if (onSubmit) {
      onSubmit(formData);
    } else {
      console.log('Form submitted:', formData);
    }
  };

  return (
    <Form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.welcome}>
        <h2>Sign up</h2>
        <p>Fill in the information quickly and create an account to get started!</p>
      </div>

      <Input
        label={"Email"}
        placeholder={"vanessa_sonar@gmail.com"}
        value={formData.email}
        onChange={(e) => setFormData({...formData, email: e.target.value})}
      />

      <Input
        label={"Username"}
        placeholder={"vanessa_ortiz"}
        helperText={"Why is needed and requirements"}
        helperIcon={<Info/>}
        value={formData.username}
        onChange={(e) => setFormData({...formData, username: e.target.value})}
      />

      <Input
        label={"Name"}
        placeholder={"Vanessa"}
        helperText={"Why is this necessary and requirements"}
        helperIcon={<Info/>}
        value={formData.name}
        onChange={(e) => setFormData({...formData, name: e.target.value})}
      />

      <Input
        label={"Date of birth"}
        placeholder={"dd/mm/yy"}
        dropdownText={"Select"}
        dropdownOptions={dateOptions}
        iconPosition={"prefix"}
        value={formData.dateOfBirth}
        onChange={(e) => setFormData({...formData, dateOfBirth: e.target.value})}
      />

      <div className={styles.submits}>
        <Checkbox
          checked={isAgreed}
          onChange={setIsAgreed}
          label={
            <>
              I consent to the <a href="/terms" className={styles.link}>processing and storage of my personal data.</a>
            </>
          }
        />

        <Button
          icon={<RightArrow/>}
          children={"Continue"}
          variant={"light"}
          size={"large"}
          fullWidth={true}
          type="submit"
        />
      </div>
    </Form>
  );
};
