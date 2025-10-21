import type { User} from '../../../User';
import type { VisibilityState} from '../../../Access';

export interface Post {
 id: number;
 title: string;
 textContent: string;
 createdAt: Date;
 userId: number;
 visibilityStateId: number;
 /*
 *
 *
 */
 user?: User;
 visibilityState?: VisibilityState;
 files?: File[];
}