import { VisibilityState} from '../../../Access';
import { User} from '../../../User';
import { Track} from "./Track";

export interface Collection {
 id: number;
 name: string;
 visibilityStateId: number;
 coverId: number;
 /*
 *
 *
 */
 visibilityState?: VisibilityState;
 cover?: File;
 users?: User[];
 tracks?: Track[];
}