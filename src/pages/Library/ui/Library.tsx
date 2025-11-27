import React, {useState, useMemo, useCallback, useEffect} from 'react';

import {useNavigate} from 'react-router-dom';

import type {Folder, Playlist, LibraryProps} from '@pages/Library';
import {Button, FolderCard, ItemCard, PlusIcon} from "@shared/ui";
import type {Category} from "@widgets/ChipsBar";
import {ContentSections, type ContentSection} from "@widgets/ContentSections";
import {SearchFilterHeader} from "@widgets/SearchFilterHeader";
import { useGetAllFolders } from '@entities/Library';

import styles from './Library.module.css';

export const Library: React.FC<LibraryProps> = () => {
    const navigate = useNavigate();
    const [selectedCategory, setSelectedCategory] = useState<Category>('All');

    const { data: folderData, loading: foldersLoading, refetch: refetchFolders } = useGetAllFolders();

    const [folders, setFolders] = useState<Folder[]>([]);
    const [playlists] = useState<Playlist[]>([
        // TODO: Replace with collections from API
        {id: '1', name: 'Playlist 1'},
        {id: '2', name: 'Playlist 2'},
        {id: '3', name: 'Playlist 3'},
        {id: '4', name: 'Playlist 4'}
    ]);

    useEffect(() => {
        if (folderData) {
            setFolders(
                folderData.map((f) => ({
                    id: String(f.id),
                    name: f.name,
                    itemCount: f.collections.length,
                }))
            );
        }
    }, [folderData]);

    useEffect(() => {
        refetchFolders?.();
    }, [refetchFolders]);

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
    }, [navigate, selectedCategory]);

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

    const isLoading = foldersLoading;

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
                variant={"filled"}
                theme={"light"}
                onClick={handleCreateNew}
                disabled={isLoading}
            >
                Create New
            </Button>
            <ContentSections sections={sections} />
        </div>
    );
};
