import React,{ useMemo,useState } from 'react';

import { useNavigate } from 'react-router-dom';

import { useGetPlaybackQualitiesQuery } from '@shared/api';
import { isDemoMode } from '@shared/config/data-source';
import { useClientSettings } from '@shared/store/features/clientSettings/useClientSettings';
import { Button,LeftArrow,Select,SettingsItem,SettingsSection,Toggle } from '@shared/ui';

import styles from './PlaybackSettings.module.css';
export const PlaybackSettings: React.FC = () => {
  const navigate = useNavigate();
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
    if (!await patchSettings(updates)) return;
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
        <h2 className={styles.title}>Playback</h2>
      </div>
      <div className={styles.content}>
        <SettingsSection title="Audio Quality">
          <Select
            label={isDemoMode ? "Quality preference (demo has one MP3 rendition)" : "Preferred playback quality"}
            options={qualityOptions}
            value={currentQuality}
            onChange={handleQualityChange}
          />
        </SettingsSection>
        <SettingsSection title="Playback Options">
          <SettingsItem
            label="Autoplay"
            description={isDemoMode ? "Unavailable in demo. Playback follows your queue." : "Automatically play similar content when your music ends"}
            rightContent={
              <Toggle
                disabled={isDemoMode} checked={currentAutoPlay}
                onChange={handleAutoPlayChange}
              />
            }
            showArrow={false}
          />
          <SettingsItem
            label="Crossfade"
            description={isDemoMode ? "Crossfade is unavailable in demo." : "Fade between tracks for seamless listening"}
            rightContent={
              <Toggle
                disabled={isDemoMode} checked={currentCrossfade}
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
