import type { Collection } from "./Collection";
import type { User } from '@entities/User';

export interface Playlist extends Collection {
 creatorId: number;
 creator?: User;
}