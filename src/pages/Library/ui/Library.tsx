import React, {useState, useMemo, useCallback, useEffect} from 'react';

import {useNavigate} from 'react-router-dom';

import type {Folder, Playlist, LibraryProps} from '@pages/Library';
import {Button, FolderCard, ItemCard, PlusIcon, LeftArrow} from "@shared/ui";
import type {Category} from "@widgets/ChipsBar";
import {ContentSections, type ContentSection} from "@widgets/ContentSections";
import {SearchFilterHeader} from "@widgets/SearchFilterHeader";
import { useGetFoldersQuery, useGetFolderQuery } from '@shared/api';
import { getImageUrlById } from '@shared/lib/image-utils';

import styles from './Library.module.css';

export const Library: React.FC<LibraryProps> = () => {
    const navigate = useNavigate();
    const [selectedCategory, setSelectedCategory] = useState<Category>('All');
    const [currentFolderId, setCurrentFolderId] = useState<number | null>(null);

    // Загрузка данных для корневой папки (когда currentFolderId === null)
    const { data: foldersData, isLoading: foldersLoading, refetch: refetchFolders } = useGetFoldersQuery(undefined, {
        skip: currentFolderId !== null,
    });

    // Загрузка данных для конкретной папки (когда currentFolderId !== null)
    const { data: folderData, isLoading: folderLoading } = useGetFolderQuery(currentFolderId!, {
        skip: currentFolderId === null,
    });

    const [folders, setFolders] = useState<Folder[]>([]);
    const [playlists, setPlaylists] = useState<Playlist[]>([]);

    // Обработка данных для корневой папки
    useEffect(() => {
        if (foldersData && currentFolderId === null) {
            // Находим Root папку (где parentFolderId === null)
            const rootFolder = foldersData.find(f => f.parentFolderId === null || f.parentFolderId === undefined);
            
            if (rootFolder) {
                // Получаем ID всех subFolders Root для исключения дубликатов
                const rootSubFolderIds = new Set(rootFolder.subFolders.map(sf => sf.id));
                
                // Преобразуем subFolders Root в формат Folder
                // Используем полную информацию о папке из foldersData, если она есть
                const rootSubFolders: Folder[] = rootFolder.subFolders.map((subFolder) => {
                    // Ищем полную информацию о папке в foldersData
                    const fullFolder = foldersData.find(f => f.id === subFolder.id);
                    return {
                        id: String(subFolder.id),
                        name: subFolder.name,
                        itemCount: fullFolder ? (fullFolder.collections.length + fullFolder.subFolders.length) : (subFolder.collectionCount + subFolder.subFolderCount),
                    };
                });
                
                // Преобразуем collections Root в формат Playlist
                const rootCollections: Playlist[] = rootFolder.collections.map((collection) => ({
                    id: String(collection.id),
                    name: collection.name,
                    coverImage: getImageUrlById(collection.coverId),
                }));
                
                // Исключаем Root папку и её subFolders из списка, показываем только остальные папки
                const otherFolders = foldersData
                    .filter(f => 
                        f.id !== rootFolder.id && 
                        f.parentFolderId !== null &&
                        !rootSubFolderIds.has(f.id) // Исключаем папки, которые уже в subFolders Root
                    )
                    .map((f) => ({
                        id: String(f.id),
                        name: f.name,
                        itemCount: f.collections.length + f.subFolders.length,
                    }));
                
                // Объединяем subFolders Root с остальными папками
                setFolders([...rootSubFolders, ...otherFolders]);
                setPlaylists(rootCollections);
            } else {
                // Если Root папки нет, обрабатываем все папки как обычно
                setFolders(
                    foldersData.map((f) => ({
                        id: String(f.id),
                        name: f.name,
                        itemCount: f.collections.length + f.subFolders.length,
                    }))
                );
                
                // Собираем все коллекции из всех папок
                const allCollections: Playlist[] = foldersData.flatMap(f => 
                    f.collections.map(c => ({
                        id: String(c.id),
                        name: c.name,
                        coverImage: getImageUrlById(c.coverId),
                    }))
                );
                setPlaylists(allCollections);
            }
        }
    }, [foldersData, currentFolderId]);

    // Обработка данных для конкретной папки
    useEffect(() => {
        if (folderData && currentFolderId !== null) {
            // Преобразуем subFolders в формат Folder
            const subFolders: Folder[] = folderData.subFolders.map((subFolder) => ({
                id: String(subFolder.id),
                name: subFolder.name,
                itemCount: subFolder.collectionCount + subFolder.subFolderCount,
            }));
            
            // Преобразуем collections в формат Playlist
            const collections: Playlist[] = folderData.collections.map((collection) => ({
                id: String(collection.id),
                name: collection.name,
                coverImage: getImageUrlById(collection.coverId),
            }));
            
            setFolders(subFolders);
            setPlaylists(collections);
        } else if (currentFolderId !== null && !folderData && !folderLoading) {
            // Очищаем данные при переключении на другую папку (во время загрузки)
            setFolders([]);
            setPlaylists([]);
        }
    }, [folderData, currentFolderId, folderLoading]);

    useEffect(() => {
        if (currentFolderId === null) {
            void refetchFolders();
        }
    }, [refetchFolders, currentFolderId]);

    const handleFolderClick = useCallback((folder: Folder) => {
        setCurrentFolderId(Number(folder.id));
    }, []);

    const handleBackToRoot = useCallback(() => {
        setCurrentFolderId(null);
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

    // Определяем заголовок: название текущей папки или "Library"
    const headerTitle = currentFolderId !== null && folderData 
        ? folderData.name 
        : 'Library';

    // Определяем состояние загрузки
    const isLoading = currentFolderId === null ? foldersLoading : folderLoading;

    return (
        <div className={styles.container}>
            <div className={styles.headerContainer}>
                {currentFolderId !== null && (
                    <Button
                        variant="filled"
                        theme="dark"
                        size="medium"
                        shape="cr-16"
                        iconOnly
                        icon={<LeftArrow/>}
                        onClick={handleBackToRoot}
                        className={styles.backButton}
                    />
                )}
                <SearchFilterHeader
                    title={headerTitle}
                    selectedCategory={selectedCategory}
                    onCategoryChange={setSelectedCategory}
                />
            </div>
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
