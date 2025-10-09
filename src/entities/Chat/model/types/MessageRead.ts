import type { Message} from "./Message";
import type { User} from '../../../User';

export interface MessageRead {
 id: number;
 readAt?: Date;
 messageId: number;
 userId: number;
 /*
 *
 *
 */
 message?: Message;
 user?: User;
}