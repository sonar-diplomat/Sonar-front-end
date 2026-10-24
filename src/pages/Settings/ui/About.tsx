import React from 'react';

import { useNavigate } from 'react-router-dom';

import { Button,LeftArrow,SettingsItem,SettingsSection } from '@shared/ui';

import styles from './About.module.css';

export const About: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Button
          icon={<LeftArrow />}
          size="medium"
          variant="filled"
          theme="dark"
          onClick={() => navigate(-1)}
          className={styles.backButton}
          iconOnly
          aria-label="Back to settings"
        />
        <h2 className={styles.title}>About</h2>
      </div>
      
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

