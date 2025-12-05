import React, {useState, useMemo, useCallback, useEffect} from 'react';

import {useNavigate} from 'react-router-dom';

import type {Folder, Playlist, LibraryProps} from '@pages/Library';
import {Button, FolderCard, ItemCard, PlusIcon, LeftArrow} from "@shared/ui";
import type {Category} from "@widgets/ChipsBar";
import {ContentSections, type ContentSection} from "@widgets/ContentSections";
import {SearchFilterHeader} from "@widgets/SearchFilterHeader";
import { getImageUrlById } from '@shared/lib/image-utils';
import { useFolders, useFolder } from '@shared/store/features/library/useLibrary';

import styles from './Library.module.css';

export const Library: React.FC<LibraryProps> = () => {
    const navigate = useNavigate();
    const [selectedCategory, setSelectedCategory] = useState<Category>('All');
    const [currentFolderId, setCurrentFolderId] = useState<number | null>(null);

    // Загрузка данных для корневой папки (когда currentFolderId === null)
    const { folders: foldersData, isLoading: foldersLoading, refetchFolders } = useFolders();

    // Загрузка данных для конкретной папки (когда currentFolderId !== null)
    const { folder: folderData, isLoading: folderLoading, error: folderError } = useFolder(currentFolderId);

    const [folders, setFolders] = useState<Folder[]>([]);
    const [playlists, setPlaylists] = useState<Playlist[]>([]);

    // Обработка данных для корневой папки
    // Root папка (parentFolderId === null) скрывается от пользователя
    // Её subFolders и collections отображаются как корневые элементы
    useEffect(() => {
        if (foldersData && currentFolderId === null) {
            // Находим Root папку (где parentFolderId === null)
            const rootFolder = foldersData.find(f => f.parentFolderId === null || f.parentFolderId === undefined);
            
            if (rootFolder) {
                // Преобразуем subFolders Root в формат Folder
                // Используем subFolderCount и collectionCount из SubFolderDTO
                const rootSubFolders: Folder[] = rootFolder.subFolders.map((subFolder) => ({
                    id: String(subFolder.id),
                    name: subFolder.name,
                    itemCount: subFolder.collectionCount + subFolder.subFolderCount,
                }));
                
                // Преобразуем collections Root в формат Playlist
                const rootCollections: Playlist[] = rootFolder.collections.map((collection) => ({
                    id: String(collection.id),
                    name: collection.name,
                    coverImage: getImageUrlById(collection.coverId),
                    type: collection.type,
                }));
                
                // Показываем subFolders Root как корневые папки
                // Показываем collections Root как корневые коллекции
                // Сама Root папка скрыта
                setFolders(rootSubFolders);
                setPlaylists(rootCollections);
            } else {
                // Если Root папки нет, обрабатываем все папки как обычно
                const allFolders: Folder[] = foldersData.map((folder) => ({
                    id: String(folder.id),
                    name: folder.name,
                    itemCount: folder.collections.length + folder.subFolders.length,
                }));
                
                // Собираем все коллекции из всех папок
                const allCollections: Playlist[] = foldersData.flatMap(folder => 
                    folder.collections.map(collection => ({
                        id: String(collection.id),
                        name: collection.name,
                        coverImage: getImageUrlById(collection.coverId),
                        type: collection.type,
                    }))
                );
                
                setFolders(allFolders);
                setPlaylists(allCollections);
            }
        }
    }, [foldersData, currentFolderId]);

    // Очистка данных при переходе на другую папку
    useEffect(() => {
        if (currentFolderId !== null) {
            // Очищаем данные сразу при переходе на другую папку
            setFolders([]);
            setPlaylists([]);
        }
    }, [currentFolderId]);

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
                type: collection.type,
            }));
            
            setFolders(subFolders);
            setPlaylists(collections);
        } else if (currentFolderId !== null && !folderLoading && !folderData && folderError) {
            // Если загрузка завершилась с ошибкой, оставляем данные пустыми
            setFolders([]);
            setPlaylists([]);
        }
    }, [folderData, currentFolderId, folderLoading, folderError]);

    // Удален useEffect с refetchFolders, так как теперь запросы управляются через isDirty флаг

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
        navigate('/library/create', { 
            state: { parentFolderId: currentFolderId } 
        });
    }, [navigate, selectedCategory, currentFolderId]);

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
                    to={`/playlist/${playlist.id}`}
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
