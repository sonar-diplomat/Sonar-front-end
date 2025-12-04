export interface Folder {
    id: string;
    name: string;
    itemCount?: number;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface Playlist {
    id: string;
    name: string;
    description?: string;
    coverImage?: string;
    trackCount?: number;
    type?: string; // "Album", "Playlist", "Blend"
    createdAt?: Date;
    updatedAt?: Date;
}

export type LibraryCategory = 'All' | 'Creators' | 'Playlists' | 'Radio';

export interface LibraryState {
    folders: Folder[];
    playlists: Playlist[];
    searchQuery: string;
    selectedCategory: LibraryCategory;
    isLoading: boolean;
    error: string | null;
}

// Event handler types
export type FolderClickHandler = (folder: Folder) => void;
export type PlaylistClickHandler = (playlist: Playlist) => void;
export type CreateNewHandler = () => void;

export interface LibraryProps {
    className?: string;
    onFolderClick?: FolderClickHandler;
    onPlaylistClick?: PlaylistClickHandler;
    onCreateNew?: CreateNewHandler;
}