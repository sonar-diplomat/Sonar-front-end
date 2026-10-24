import React,{ useState } from 'react';

import { useNavigate } from 'react-router-dom';

import { isDemoMode } from '@shared/config/data-source';
import { useNotifications } from '@shared/store/notificationStore';
import { Button,LeftArrow,Modal,SettingsItem,SettingsSection } from '@shared/ui';

import styles from './Settings.module.css';

export const Settings: React.FC = () => {
  const navigate = useNavigate();
  const [resetOpen, setResetOpen] = useState(false);
  const [resetting, setResetting] = useState(false);
  const { showError } = useNotifications();
  const reset = async () => {
    setResetting(true);
    try { const runtime = await import('@demo-runtime'); await runtime.resetDemoState(); await navigate('/home', { replace: true }); window.location.reload(); }
    catch { setResetting(false); showError('Unable to reset demo data'); }
  };

  return (
    <div className={styles.container}>
      <Button
        icon={<LeftArrow/>}
        children={'Back'}
        size={'medium'}
        variant="filled"
        theme="dark"
        onClick={() => navigate(-1)}
        className={styles.backButton}
      />

      <div className={styles.titleSection}>
        <h2 className={styles.title}>Settings</h2>
      </div>

      {isDemoMode && <SettingsSection title="Demo data"><p>Changes, messages and subscriptions are local to this browser.</p><Button theme="dark" onClick={() => setResetOpen(true)}>Reset demo</Button></SettingsSection>}
      <Modal isOpen={resetOpen} onClose={() => setResetOpen(false)} title="Reset demo?">
        <p>Restore the original songs, playlists, messages and settings. Your local demo changes and uploads will be removed.</p>
        <Button disabled={resetting} onClick={() => void reset()}>Restore demo data</Button>
        <Button theme="dark" onClick={() => setResetOpen(false)}>Cancel</Button>
      </Modal>
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
