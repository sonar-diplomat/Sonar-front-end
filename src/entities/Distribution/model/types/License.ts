import type { User } from '@entities/User';

export interface License {
 id: number;
 issuingDate: Date;
 expirationDate: Date;
 issuerId: number;
 /*
 *
 *
 */
 issuer?: User;
}