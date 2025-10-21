import type { User } from '@entities/User';
import type { Collection } from "./Collection";

export interface Blend extends Collection {
 users?: User[];
}