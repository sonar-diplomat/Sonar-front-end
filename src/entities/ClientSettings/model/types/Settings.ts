import { PlaybackQuality} from "./PlaybackQuality";
import { Language} from "./Language";
import { Theme} from "./Theme";
import { NotificationType} from "./NotificationType";
import { User} from '../../../User';
import { UserPrivacySettings} from "./UserPrivacySettings";

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
 blockedUserIds?: number[];
 /*
 *
 *
 */
 preferredPlaybackQuality?: PlaybackQuality;
 language?: Language;
 theme?: Theme;
 notificationTypes?: NotificationType[];
 user?: User;
 userPrivacy?: UserPrivacySettings;
}