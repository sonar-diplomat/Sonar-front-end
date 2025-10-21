import type { Collection } from "./Collection";
import type { Artist } from '@entities/Distribution';

export interface Album extends Collection {
 artists?: Artist[];
}