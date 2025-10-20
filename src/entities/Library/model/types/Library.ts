import type { User } from '@entities/User';

export interface Library {
 id: number;
 userId: number;
 user?: User;
}