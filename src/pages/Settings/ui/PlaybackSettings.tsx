import React, { useState, useMemo } from 'react';
import styles from './PlaybackSettings.module.css';
import { SettingsSection, SettingsItem, Toggle, Select, Button } from '@shared/ui';
import { ProfileHeader } from '@widgets/ProfileHeader';
import { useClientSettings } from '@shared/store/features/clientSettings/useClientSettings';
import { useGetPlaybackQualitiesQuery } from '@shared/api';
export const PlaybackSettings: React.FC = () => {
  const { settings, patchSettings, isLoading: isPatching } = useClientSettings();
  const { data: qualities, isLoading: qualitiesLoading } = useGetPlaybackQualitiesQuery();
  const [autoPlay, setAutoPlay] = useState<boolean | undefined>(undefined);
  const [crossfade, setCrossfade] = useState<boolean | undefined>(undefined);
  const [explicitContent, setExplicitContent] = useState<boolean | undefined>(undefined);
  const [preferredQuality, setPreferredQuality] = useState<number | undefined>(undefined);
  const [hasChanges, setHasChanges] = useState(false);
  const qualityOptions = useMemo(() => {
    if (!qualities) return [];
    return qualities.map(q => ({
      value: q.id,
      label: `${q.name} (${q.bitRate} kbps)`,
    }));
  }, [qualities]);
  const isLoading = isPatching || qualitiesLoading;
  const handleSave = async () => {
    const quality = preferredQuality ?? settings?.preferredPlaybackQuality?.id;
    const auto = autoPlay ?? settings?.autoPlay;
    const cross = crossfade ?? settings?.crossfade;
    const explicit = explicitContent ?? settings?.explicitContent;
    if (quality === undefined || auto === undefined || cross === undefined || explicit === undefined) return;
    const updates = {
      autoPlay: auto,
      crossfade: cross,
      explicitContent: explicit,
      preferredPlaybackQualityId: quality,
    };
    await patchSettings(updates);
    setHasChanges(false);
  };
  const handleAutoPlayChange = (checked: boolean) => {
    setAutoPlay(checked);
    setHasChanges(true);
  };
  const handleCrossfadeChange = (checked: boolean) => {
    setCrossfade(checked);
    setHasChanges(true);
  };
  const handleExplicitContentChange = (checked: boolean) => {
    setExplicitContent(checked);
    setHasChanges(true);
  };
  const handleQualityChange = (value: string | number) => {
    setPreferredQuality(Number(value));
    setHasChanges(true);
  };

  const currentQuality = preferredQuality ?? settings?.preferredPlaybackQuality?.id;
  const currentAutoPlay: boolean = autoPlay ?? settings?.autoPlay ?? false;
  const currentCrossfade: boolean = crossfade ?? settings?.crossfade ?? false;
  const currentExplicitContent: boolean = explicitContent ?? settings?.explicitContent ?? false;

  return (
    <div className={styles.container}>
      <ProfileHeader title="Playback" showBackButton />
      <div className={styles.content}>
        <SettingsSection title="Audio Quality">
          <Select
            label="Preferred playback quality"
            options={qualityOptions}
            value={currentQuality}
            onChange={handleQualityChange}
          />
        </SettingsSection>
        <SettingsSection title="Playback Options">
          <SettingsItem
            label="Autoplay"
            description="Automatically play similar content when your music ends"
            rightContent={
              <Toggle
                checked={currentAutoPlay}
                onChange={handleAutoPlayChange}
              />
            }
            showArrow={false}
          />
          <SettingsItem
            label="Crossfade"
            description="Fade between tracks for seamless listening"
            rightContent={
              <Toggle
                checked={currentCrossfade}
                onChange={handleCrossfadeChange}
              />
            }
            showArrow={false}
          />
          <SettingsItem
            label="Allow Explicit Content"
            description="Show songs with explicit lyrics"
            rightContent={
              <Toggle
                checked={currentExplicitContent}
                onChange={handleExplicitContentChange}
              />
            }
            showArrow={false}
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
