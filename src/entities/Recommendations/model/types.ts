export interface PopularCollectionDTO {
  collectionId: number;
  collectionType: number;
  score: number;
  plays: number;
  likes: number;
  adds: number;
}

export interface RecentCollectionDTO {
  collectionId: number;
  collectionType: number;
  lastPlayedAtUtc: string;
}

export interface RecentTrackDTO {
  trackId: number;
  lastPlayedAtUtc: string;
  contextId: number | null;
  contextType: number;
}

export interface CursorPageDTO<T> {
  items: T[];
  nextCursor: string | null;
}

