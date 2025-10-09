import type { Collection} from "./Collection";
import type { Artist} from '../../../Distribution';

export interface Album extends Collection {
 artists?: Artist[];
}