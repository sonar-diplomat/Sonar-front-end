import type { Collection} from "./Collection";
import type { User} from '../../../User';

export interface Playlist extends Collection {
 creatorId: number;
 creator?: User;
}