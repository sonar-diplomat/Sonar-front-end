import React, { useState } from 'react';
import styles from './PrivacySettings.module.css';
import { SettingsSection, Select, Button } from '@shared/ui';
import { ProfileHeader } from '@widgets/ProfileHeader';
import { useClientSettings } from '@shared/store/features/clientSettings/useClientSettings';
import { useNotifications } from '@shared/store/notificationStore';

const privacyOptions = [
  { value: 1, label: 'Everyone' },
  { value: 2, label: 'Friends' },
  { value: 3, label: 'Only Me' },
];

export const PrivacySettings: React.FC = () => {
  const { settings, patchSettings, isLoading } = useClientSettings();
  const [whichCanViewProfile, setWhichCanViewProfile] = useState<number | undefined>(undefined);
  const [whichCanMessage, setWhichCanMessage] = useState<number | undefined>(undefined);
  const [hasChanges, setHasChanges] = useState(false);
  const { showSuccess, showError } = useNotifications();

  const handleSave = async () => {
    if (!settings || whichCanViewProfile === undefined || whichCanMessage === undefined) return;
    const updates = {
      userPrivacySettingsId: settings.userPrivacySettingsId,
      userPrivacy: {
        id: settings.userPrivacy?.id || settings.userPrivacySettingsId,
        settingsId: settings.id,
        whichCanViewProfileId: whichCanViewProfile,
        whichCanMessageId: whichCanMessage,
      }
    };
    try {
      await patchSettings(updates);
      setHasChanges(false);
      showSuccess('Privacy settings updated successfully!');
    } catch (err: any) {
      showError(err?.data?.message || err?.message || 'Failed to update privacy settings', err?.data?.errors || err?.data?.details);
    }
  };
  const handleWhichCanViewProfileChange = (value: string | number) => {
    setWhichCanViewProfile(Number(value));
    setHasChanges(true);
  };
  const handleWhichCanMessageChange = (value: string | number) => {
    setWhichCanMessage(Number(value));
    setHasChanges(true);
  };

  const currentViewProfile = whichCanViewProfile ?? (settings?.userPrivacy as any)?.whichCanViewProfile?.id;
  const currentMessage = whichCanMessage ?? (settings?.userPrivacy as any)?.whichCanMessage?.id;

  return (
    <div className={styles.container}>
      <ProfileHeader title="Privacy" showBackButton />
      <div className={styles.content}>
        <SettingsSection title="Profile Privacy">
          <Select
            label="Who can view your profile"
            options={privacyOptions}
            value={currentViewProfile}
            onChange={handleWhichCanViewProfileChange}
          />
        </SettingsSection>
        <SettingsSection title="Communication Privacy">
          <Select
            label="Who can message you"
            options={privacyOptions}
            value={currentMessage}
            onChange={handleWhichCanMessageChange}
          />
        </SettingsSection>
        {hasChanges && (
          <div className={styles.saveButtonContainer}>
            <Button
              variant="filled"
              theme="dark"
              size="large"
              fullWidth
              onClick={handleSave}
              loading={isLoading}
            >
              Save Changes
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
