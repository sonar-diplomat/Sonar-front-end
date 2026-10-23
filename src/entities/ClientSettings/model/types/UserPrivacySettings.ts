//import type { UserPrivacyGroup } from '@entities/User';
import type { Settings } from './Settings';

export interface UserPrivacySettings {
 id: number;
 settingsId: number;
 whichCanViewProfileId: number;
 whichCanMessageId: number;
 whichCanViewProfile?: { id: number; name: string };
 whichCanMessage?: { id: number; name: string };
 /*
 *
 *
 */
 settings?: Settings;
 // whichCanViewProfile?: UserPrivacyGroup;
 // whichCanMessage?: UserPrivacyGroup;
}
