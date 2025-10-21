import type { User } from '@entities/User';

export interface AccessFeature {
 id: number;
 name: string;
 users?: User[];
}
