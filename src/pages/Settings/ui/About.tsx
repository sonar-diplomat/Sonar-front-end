import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './About.module.css';
import { SettingsSection, SettingsItem } from '@shared/ui';
import { ProfileHeader } from '@widgets/ProfileHeader';

export const About: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className={styles.container}>
      <ProfileHeader title="About" showBackButton />
      
      <div className={styles.content}>
        <SettingsSection title="Legal">
          <SettingsItem
            label="Terms of Service"
            description="Read our terms and conditions"
            onClick={() => navigate('/terms')}
          />
        </SettingsSection>

        <SettingsSection title="App Information">
          <SettingsItem
            label="Version"
            description="1.0.0"
            showArrow={false}
          />
          <SettingsItem
            label="Build"
            description="2025.11.29"
            showArrow={false}
          />
        </SettingsSection>

        <div className={styles.footer}>
          <p className={styles.copyright}>© 2025 Sonar. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

