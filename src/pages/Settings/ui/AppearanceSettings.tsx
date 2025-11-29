import React, { useState, useMemo } from 'react';
import styles from './AppearanceSettings.module.css';
import { SettingsSection, Select, Button } from '@shared/ui';
import { ProfileHeader } from '@widgets/ProfileHeader';
import { useClientSettings } from '@shared/store/features/clientSettings/useClientSettings';
import { useGetLanguagesQuery, useGetThemesQuery } from '@shared/api';
export const AppearanceSettings: React.FC = () => {
  const { settings, patchSettings, isLoading: isPatching } = useClientSettings();
  const { data: languages, isLoading: languagesLoading } = useGetLanguagesQuery();
  const { data: themes, isLoading: themesLoading } = useGetThemesQuery();
  const [language, setLanguage] = useState<number | undefined>(undefined);
  const [theme, setTheme] = useState<number | undefined>(undefined);
  const [hasChanges, setHasChanges] = useState(false);
  const languageOptions = useMemo(() => {
    if (!languages) return [];
    return languages.map(lang => ({
      value: lang.id,
      label: lang.name,
    }));
  }, [languages]);
  const themeOptions = useMemo(() => {
    if (!themes) return [];
    return themes.map(t => ({
      value: t.id,
      label: t.name,
    }));
  }, [themes]);
  const isLoading = isPatching || languagesLoading || themesLoading;
  const handleSave = async () => {
    const langId = language ?? settings?.language?.id;
    const themeId = theme ?? settings?.theme?.id;
    if (langId === undefined || themeId === undefined) return;
    const updates = {
      languageId: langId,
      themeId: themeId,
    };
    await patchSettings(updates);
    setHasChanges(false);
  };
  const handleLanguageChange = (value: string | number) => {
    setLanguage(Number(value));
    setHasChanges(true);
  };
  const handleThemeChange = (value: string | number) => {
    setTheme(Number(value));
    setHasChanges(true);
  };

  const currentLanguage = language ?? settings?.language?.id;
  const currentTheme = theme ?? settings?.theme?.id;

  return (
    <div className={styles.container}>
      <ProfileHeader title="Language and Theme" showBackButton />
      <div className={styles.content}>
        <SettingsSection title="Language">
          <Select
            label="App Language"
            options={languageOptions}
            value={currentLanguage!}
            onChange={handleLanguageChange}
          />
        </SettingsSection>
        <SettingsSection title="Theme">
          <Select
            label="App Theme"
            options={themeOptions}
            value={currentTheme!}
            onChange={handleThemeChange}
          />
        </SettingsSection>
        {hasChanges && (
          <div className={styles.saveButtonContainer}>
            <Button
              variant="dark"
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
