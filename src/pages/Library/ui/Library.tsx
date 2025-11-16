import React, {useState, useMemo, useCallback} from 'react';
import styles from './Library.module.css';
import {Button, FolderCard, Input, ItemCard, ItemCardContainer, PlusIcon, SearchIcon} from "@shared/ui";
import {ChipsBar, type Category} from "@widgets/ChipsBar";
import type {Folder, Playlist, LibraryProps} from '@pages/Library';
import {useNavigate} from 'react-router-dom';

export const Library: React.FC<LibraryProps> = ({className = ''}) => {
    const navigate = useNavigate();
    const [selectedCategory, setSelectedCategory] = useState<Category>('All');

    const [folders, setFolders] = useState<Folder[]>([
        {id: '1', name: 'Every day'},
        {id: '2', name: 'Gym'},
        {id: '3', name: 'Party'},
        {id: '4', name: 'Work'}
    ]);

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
        // TODO: navigate to create page
        // navigate(`/create`);
    }, [selectedCategory]);

    // Filter
    const shouldShowFolders = useMemo(() => {
        return selectedCategory === 'All';
    }, [selectedCategory]);

    const shouldShowPlaylists = useMemo(() => {
        return selectedCategory === 'All' || selectedCategory === 'Playlists';
    }, [selectedCategory]);

    return (
        <div className={styles.container}>
            <div className={styles.title}>
                Library
            </div>
            <div className={styles.searchWrapper}>
                <Input type={"text"} placeholder={"Search in library"} icon={<SearchIcon/>} iconPosition={"suffix"} />
            </div>
            <ChipsBar
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
            <div className={styles.sectionsContainer}>
                {shouldShowFolders && (
                    <ItemCardContainer title={"Folders"} count={folders.length} countLabel={"folders"}>
                        {folders.map((folder) => (
                            <FolderCard
                                key={folder.id}
                                label={folder.name}
                                onClick={() => handleFolderClick(folder)}
                            />
                        ))}
                    </ItemCardContainer>
                )}
                {shouldShowPlaylists && (
                    <ItemCardContainer title={"Playlists"} count={playlists.length} countLabel={"playlists"}>
                        {playlists.map((playlist) => (
                            <ItemCard
                                key={playlist.id}
                                image={playlist.coverImage}
                                textContent={{
                                    title: playlist.name,
                                    subtitle1: playlist.description
                                }}
                                onClick={() => handlePlaylistClick(playlist)}
                            />
                        ))}
                    </ItemCardContainer>
                )}
            </div>
        </div>
    );
};
