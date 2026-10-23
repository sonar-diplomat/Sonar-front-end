import React,{ useState } from 'react';

import { useNavigate } from 'react-router-dom';

import { useClientSettings } from '@shared/store/features/clientSettings/useClientSettings';
import { useNotifications } from '@shared/store/notificationStore';
import { Button,LeftArrow,Select,SettingsSection } from '@shared/ui';
import { asUiApiError } from '@shared/ui/api-error';

import styles from './PrivacySettings.module.css';

const privacyOptions = [
  { value: 1, label: 'Everyone' },
  { value: 2, label: 'Friends' },
  { value: 3, label: 'Only Me' },
];

export const PrivacySettings: React.FC = () => {
  const navigate = useNavigate();
  const { settings, patchSettings, isLoading } = useClientSettings();
  const [whichCanViewProfile, setWhichCanViewProfile] = useState<number | undefined>(undefined);
  const [whichCanMessage, setWhichCanMessage] = useState<number | undefined>(undefined);
  const [hasChanges, setHasChanges] = useState(false);
  const { showSuccess, showError } = useNotifications();

  const handleSave = async () => {
    if (!settings) return;
    const viewId = whichCanViewProfile ?? settings.userPrivacy?.whichCanViewProfileId;
    const messageId = whichCanMessage ?? settings.userPrivacy?.whichCanMessageId;
    if (viewId === undefined || messageId === undefined) return;
    const updates = {
      userPrivacySettingsId: settings.userPrivacySettingsId,
      userPrivacy: {
        id: settings.userPrivacy?.id || settings.userPrivacySettingsId,
        settingsId: settings.id,
        whichCanViewProfileId: viewId,
        whichCanMessageId: messageId,
      }
    };
    try {
      if (!await patchSettings(updates)) return;
      setHasChanges(false);
      showSuccess('Privacy settings updated successfully!');
    } catch (caught: unknown) { const err = asUiApiError(caught);
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

  const currentViewProfile = whichCanViewProfile ?? settings?.userPrivacy?.whichCanViewProfile?.id;
  const currentMessage = whichCanMessage ?? settings?.userPrivacy?.whichCanMessage?.id;

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
        <h2 className={styles.title}>Privacy</h2>
      </div>
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
