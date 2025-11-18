import type { PlaybackQuality } from "./PlaybackQuality";
import type { Language } from "./Language";
import type { Theme } from "./Theme";
import type { NotificationType } from "./NotificationType";
import type { User } from '@entities/User';
import type { UserPrivacySettings } from "./UserPrivacySettings";

export interface Settings {
 id: number;
 autoPlay: boolean;
 crossfade: boolean;
 explicitContent: boolean;
 preferredPlaybackQualityId: number;
 languageId: number;
 themeId: number;
 notificationTypeId: number;
 userId: number;
 userPrivacySettingsId: number;
 /*
 *
 *
 */
 preferredPlaybackQuality?: PlaybackQuality;
 language?: Language;
 theme?: Theme;
 notificationType?: NotificationType;
 user?: User;
 userPrivacy?: UserPrivacySettings;
}