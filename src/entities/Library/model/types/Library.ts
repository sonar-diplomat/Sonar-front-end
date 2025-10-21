import type { User} from '../../../User';

export interface Library {
 id: number;
 userId: number;
 user?: User;
}