/**
 * Search DTOs based on Documentation/All_DTOs.txt
 */

// AuthorDTO definition (from Music DTOs)
export interface AuthorDTO {
  pseudonym: string;
  artistId?: number;
}

// Search Result DTOs
export interface SearchResultDTO {
  query: string;
  totalResults: number;
  tracks?: SearchTracksResultDTO;
  albums?: SearchAlbumsResultDTO;
  playlists?: SearchPlaylistsResultDTO;
  artists?: SearchArtistsResultDTO;
  users?: SearchUsersResultDTO;
}

export interface SearchTracksResultDTO {
  total: number;
  items: TrackSearchItemDTO[];
}

export interface SearchAlbumsResultDTO {
  total: number;
  items: AlbumSearchItemDTO[];
}

export interface SearchPlaylistsResultDTO {
  total: number;
  items: PlaylistSearchItemDTO[];
}

export interface SearchArtistsResultDTO {
  total: number;
  items: ArtistSearchItemDTO[];
}

export interface SearchUsersResultDTO {
  total: number;
  items: UserSearchItemDTO[];
}

// Search Item DTOs
export interface TrackSearchItemDTO {
  id: number;
  title: string;
  durationInSeconds: number;
  coverId: number;
  artists: AuthorDTO[];
  albumId?: number;
  albumName?: string;
}

export interface AlbumSearchItemDTO {
  id: number;
  name: string;
  coverId: number;
  trackCount: number;
  authors: AuthorDTO[];
  distributorName?: string;
}

export interface PlaylistSearchItemDTO {
  id: number;
  name: string;
  coverId: number;
  trackCount: number;
  creatorName: string;
  contributorNames: string[];
}

export interface ArtistSearchItemDTO {
  id: number;
  artistName: string;
  userId: number;
  avatarImageId?: number;
  trackCount: number;
  albumCount: number;
}

export interface UserSearchItemDTO {
  id: number;
  userName: string;
  publicIdentifier: string;
  avatarImageId: number;
  isArtist: boolean;
  artistName?: string;
}

// Search Parameters
export type SearchCategory = 'All' | 'Tracks' | 'Albums' | 'Playlists' | 'Artists' | 'Users' | 'Creators';

export interface SearchParams {
  query: string;
  category?: SearchCategory;
  limit?: number;
  offset?: number;
}

export interface SearchTracksParams {
  query: string;
  limit?: number;
  offset?: number;
}

export interface SearchAlbumsParams {
  query: string;
  limit?: number;
  offset?: number;
}

export interface SearchPlaylistsParams {
  query: string;
  limit?: number;
  offset?: number;
}

export interface SearchArtistsParams {
  query: string;
  limit?: number;
  offset?: number;
}

export interface SearchUsersParams {
  query: string;
  limit?: number;
  offset?: number;
}

export interface SearchSuggestionsParams {
  query: string;
  limit?: number;
}

export interface SearchPopularParams {
  limit?: number;
}

