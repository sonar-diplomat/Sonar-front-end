import type { FileType} from "./FileType";

export interface File {
 id: number;
 itemName: string;
 url: string;
 typeId: number;
 type?: FileType;
}