import type { User } from '../../../User';

export interface AccessFeature {
 id: number;
 name: string;
 users?: User[];
}
