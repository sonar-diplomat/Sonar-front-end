import React from 'react';
import styles from './SettingsSection.module.css';

export interface SettingsSectionProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

export const SettingsSection: React.FC<SettingsSectionProps> = ({
  title,
  children,
  className = '',
}) => {
  return (
    <section className={`${styles.section} ${className}`}>
      <h2 className={styles.title}>{title}</h2>
      <div className={styles.items}>{children}</div>
    </section>
  );
};

