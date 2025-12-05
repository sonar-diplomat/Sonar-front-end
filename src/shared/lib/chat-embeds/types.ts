/**
 * Types for chat embed system
 */

export type EmbedType = 'track' | 'album' | 'playlist';

export interface EmbedMatch {
  type: EmbedType;
  id: number;
  url: string;
  startIndex: number;
  endIndex: number;
}

export interface TextSegment {
  type: 'text' | 'embed';
  content: string;
  embed?: EmbedMatch;
}

export interface EmbedRule {
  type: EmbedType;
  pattern: RegExp;
  extractId: (url: URL) => number | null;
}

