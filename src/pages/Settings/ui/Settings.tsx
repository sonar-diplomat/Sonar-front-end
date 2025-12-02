import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Settings.module.css';
import { SettingsSection, SettingsItem, Button, LeftArrow } from '@shared/ui';

export const Settings: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className={styles.container}>
      <Button
        icon={<LeftArrow/>}
        children={'Back'}
        size={'medium'}
        variant="filled"
        theme="dark"
        onClick={() => navigate('/profile')}
        className={styles.backButton}
      />

      <div className={styles.titleSection}>
        <h2 className={styles.title}>Settings</h2>
      </div>

      <div className={styles.content}>
        <SettingsSection title="Account">
          <SettingsItem
            label="Account"
            onClick={() => navigate('/settings/account')}
          />
          <SettingsItem
            label="Privacy"
            onClick={() => navigate('/settings/privacy')}
          />
          <SettingsItem
            label="Blocked Accounts"
            onClick={() => navigate('/settings/blocked-accounts')}
          />
        </SettingsSection>

        <SettingsSection title="General">
          <SettingsItem
            label="Language and Theme"
            onClick={() => navigate('/settings/appearance')}
          />
          <SettingsItem
            label="Playback"
            onClick={() => navigate('/settings/playback')}
          />
          <SettingsItem
            label="About"
            onClick={() => navigate('/settings/about')}
          />
        </SettingsSection>
      </div>
    </div>
  );
};

