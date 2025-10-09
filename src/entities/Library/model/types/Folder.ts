import type { Library } from './Library';
import type { Collection } from '../../../Music';

export interface Folder {
 id: number;
 name: string;
 libraryId: number;
 parentFolderId?: number;
 /*
 *
 *
 */
 library?: Library;
 parentFolder?: Folder;
 subFolders?: Folder[];
 collections?: Collection[];
}