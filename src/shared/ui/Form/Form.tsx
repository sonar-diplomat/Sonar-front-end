import React from 'react';
import styles from './Form.module.css';

export interface FormProps {
  children: React.ReactNode;
  onSubmit?: (e: React.FormEvent<HTMLFormElement>) => void;
  className?: string;
}

export const Form: React.FC<FormProps> = ({
  children,
  onSubmit,
  className
}) => {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit(e);
    }
  };

  return (
    <form
      className={`${styles.form} ${className || ''}`}
      onSubmit={handleSubmit}
    >
      {children}
    </form>
  );
};
