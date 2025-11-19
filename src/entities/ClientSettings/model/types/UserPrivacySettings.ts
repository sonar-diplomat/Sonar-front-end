//import type { UserPrivacyGroup } from '@entities/User';
import type { Settings } from './Settings';

export interface UserPrivacySettings {
 id: number;
 settingsId: number;
 whichCanViewProfileId: number;
 whichCanMessageId: number;
 /*
 *
 *
 */
 settings?: Settings;
 // whichCanViewProfile?: UserPrivacyGroup;
 // whichCanMessage?: UserPrivacyGroup;
}