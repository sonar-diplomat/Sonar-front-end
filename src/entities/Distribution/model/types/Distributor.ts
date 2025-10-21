import type { Album } from '@entities/Music';
import type { DistributorSession } from './DistributorSession';
import type { License } from './License';

export interface Distributor {
 id: number;
 name: string;
 createdAt: Date;
 description: string;
 licenseId: number;
 coverId: number;
 /*
 *
 *
 */
 license?: License;
 cover?: File;
 sessions?: DistributorSession[];
 albums?: Album[];
}