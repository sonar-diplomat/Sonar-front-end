import type { User} from '../../../User';

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