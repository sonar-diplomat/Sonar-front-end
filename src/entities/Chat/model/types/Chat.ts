import type { User } from '@entities/User';

export interface Chat {
 id: number;
 name: string;
 isGroup: boolean;
 coverId: number;
 /*
 *
 *
 */
 cover?: File;
 users?: User[];
}