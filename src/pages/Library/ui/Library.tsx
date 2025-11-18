import React, {useState, useMemo, useCallback} from 'react';

import {useNavigate} from 'react-router-dom';

import type {Folder, Playlist, LibraryProps} from '@pages/Library';
import {Button, FolderCard, ItemCard, PlusIcon} from "@shared/ui";
import type {Category} from "@widgets/ChipsBar";
import {ContentSections, type ContentSection} from "@widgets/ContentSections";
import {SearchFilterHeader} from "@widgets/SearchFilterHeader";

import styles from './Library.module.css';

export const Library: React.FC<LibraryProps> = () => {
    const navigate = useNavigate();
    const [selectedCategory, setSelectedCategory] = useState<Category>('All');

    // @ts-expect-error setFolders will be used later
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [folders, setFolders] = useState<Folder[]>([
        {id: '1', name: 'Every day'},
        {id: '2', name: 'Gym'},
        {id: '3', name: 'Party'},
        {id: '4', name: 'Work'}
    ]);

    // @ts-expect-error setPlaylists will be used later
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [playlists, setPlaylists] = useState<Playlist[]>([
        {id: '1', name: 'Playlist 1'},
        {id: '2', name: 'Playlist 2'},
        {id: '3', name: 'Playlist 3'},
        {id: '4', name: 'Playlist 4'}
    ]);

    // Event handlers
    const handleFolderClick = useCallback((folder: Folder) => {
        console.log('Opening folder:', folder);
        // TODO: Navigate to folder detail
        // navigate(`/folder/${folder.id}`);
    }, []);

    const handlePlaylistClick = useCallback((playlist: Playlist) => {
        console.log('Opening playlist:', playlist);
        // TODO: Navigate to playlist page
        // navigate(`/playlist/${playlist.id}`);
    }, []);

    const handleCreateNew = useCallback(() => {
        console.log('Create new:', selectedCategory);
        navigate('/library/create');
    }, [navigate]);

    // Define sections
    const sections = useMemo<ContentSection[]>(() => [
        {
            id: 'folders',
            title: 'Folders',
            countLabel: 'folders',
            shouldShow: selectedCategory === 'All',
            items: folders,
            renderItem: (folder: Folder) => (
                <FolderCard
                    key={folder.id}
                    label={folder.name}
                    onClick={() => handleFolderClick(folder)}
                />
            )
        },
        {
            id: 'playlists',
            title: 'Playlists',
            countLabel: 'playlists',
            shouldShow: selectedCategory === 'All' || selectedCategory === 'Playlists',
            items: playlists,
            renderItem: (playlist: Playlist) => (
                <ItemCard
                    key={playlist.id}
                    image={playlist.coverImage}
                    textContent={{
                        title: playlist.name,
                        subtitle1: playlist.description
                    }}
                    onClick={() => handlePlaylistClick(playlist)}
                />
            )
        }
    ], [selectedCategory, folders, playlists, handleFolderClick, handlePlaylistClick]);

    return (
        <div className={styles.container}>
            <SearchFilterHeader
                title="Library"
                selectedCategory={selectedCategory}
                onCategoryChange={setSelectedCategory}
            />
            <Button
                className={styles.createBtn}
                icon={<PlusIcon/>}
                onClick={handleCreateNew}
            >
                Create New
            </Button>
            <ContentSections sections={sections} />
        </div>
    );
};
