import type { User } from '@entities/User';
import type { VisibilityState } from '@entities/Access';

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