import React, { useState, type FormEvent } from 'react';
import type { UserRegisterDTO } from '@features/auth';
import styles from './RegistrationTest.module.css';
import { useRegisterMutation } from '@shared/api';


export const RegistrationTest: React.FC = () => {
  const [formData, setFormData] = useState<UserRegisterDTO>({
    userName: 'john_doe',
    login: 'johndoe',
    email: 'johndoe@gmail.com',
    password: 'securePassword123!',
    firstName: 'john',
    lastName: 'doe',
    dateOfBirth: '23-01-1990',
    locale: 'eng',
  });

  const [register, { isLoading, error: registerError }] = useRegisterMutation();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear messages when user starts typing
    setError(null);
    setSuccess(null);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      await register(formData).unwrap();
      setSuccess('Registration successful!');
      // Clear form on success
      setFormData({
        userName: '',
        login: '',
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        dateOfBirth: '',
        locale: 'en-US',
      });
    } catch (err: any) {
      const errorMsg = err?.data?.message || err?.message || 'Registration failed';
      setError(errorMsg);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h2 className={styles.title}>Registration API Test</h2>
        <p className={styles.subtitle}>Test the /api/Auth/register endpoint</p>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="username" className={styles.label}>
              Username *
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.userName}
              onChange={handleChange}
              required
              className={styles.input}
              placeholder="john_doe"
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="login" className={styles.label}>
              Login *
            </label>
            <input
              type="text"
              id="login"
              name="login"
              value={formData.login}
              onChange={handleChange}
              required
              className={styles.input}
              placeholder="johndoe"
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="email" className={styles.label}>
              Email *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className={styles.input}
              placeholder="john@example.com"
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="password" className={styles.label}>
              Password *
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className={styles.input}
              placeholder="Enter password"
            />
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="firstName" className={styles.label}>
                First Name *
              </label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
                className={styles.input}
                placeholder="John"
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="lastName" className={styles.label}>
                Last Name *
              </label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
                className={styles.input}
                placeholder="Doe"
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="dateOfBirth" className={styles.label}>
              Date of Birth *
            </label>
            <input
              type="date"
              id="dateOfBirth"
              name="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={handleChange}
              required
              className={styles.input}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="locale" className={styles.label}>
              Locale
            </label>
            <input
              type="text"
              id="locale"
              name="locale"
              value={formData.locale}
              onChange={handleChange}
              className={styles.input}
              placeholder="en-US"
            />
          </div>

          {error && (
            <div className={styles.errorMessage}>
              {error}
            </div>
          )}

          {success && (
            <div className={styles.successMessage}>
              {success}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className={styles.submitButton}
          >
            {isLoading ? 'Registering...' : 'Test Registration'}
          </button>
        </form>
      </div>
    </div>
  );
};