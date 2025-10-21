import type { User} from '../../../User';
import type { Collection} from "./Collection";

export interface Blend extends Collection {
 users?: User[];
}