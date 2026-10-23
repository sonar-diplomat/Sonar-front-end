import type { User, ImageFile } from '@entities/User';

export interface Chat {
 id: number;
 name: string;
 isGroup: boolean;
 coverId: number;
 /*
 *
 *
 */
 cover?: ImageFile;
 users?: User[];
}
