import React, {useState, useMemo, useCallback, useEffect, useRef} from 'react';

import {useNavigate} from 'react-router-dom';

import type {Folder, Playlist, LibraryProps} from '@pages/Library';
import {Button, FolderCard, ItemCard, PlusIcon, LeftArrow} from "@shared/ui";
import type {Category} from "@widgets/ChipsBar";
import {ContentSections, type ContentSection} from "@widgets/ContentSections";
import {SearchFilterHeader} from "@widgets/SearchFilterHeader";
import {LibrarySkeleton} from "@widgets/LibrarySkeleton";
import { getImageUrlById } from '@shared/lib/image-utils';
import { useFolders, useFolder } from '@shared/store/features/library/useLibrary';
import { useMoveCollectionToFolderMutation, useMoveFolderMutation } from '@entities/Library/api/rtkApi';
import type { DropInfo } from '@shared/ui/FolderCard/FolderCard.types';
import { useNotifications } from '@shared/store/notificationStore';

import styles from './Library.module.css';

export const Library: React.FC<LibraryProps> = () => {
    const navigate = useNavigate();
    const [selectedCategory, setSelectedCategory] = useState<Category>('All');
    const [currentFolderId, setCurrentFolderId] = useState<number | null>(null);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [isDraggingOverTopZone, setIsDraggingOverTopZone] = useState(false);
    const isDraggingRef = useRef(false);

    // Загрузка данных для всей структуры библиотеки (используется для поиска)
    const { folders: foldersData, isLoading: foldersLoading, refetchFolders, isDirty } = useFolders();

    // Загрузка данных для конкретной папки (когда currentFolderId !== null)
    const { folder: folderData, isLoading: folderLoading, error: folderError, refetch: refetchFolder } = useFolder(currentFolderId);

    // API мутации для drag-and-drop
    const [moveCollectionToFolder] = useMoveCollectionToFolderMutation();
    const [moveFolder] = useMoveFolderMutation();
    const { showError } = useNotifications();

    // Автоматически обновляем данные, если библиотека помечена как "грязная"
    useEffect(() => {
        if (isDirty && !foldersLoading) {
            const timeoutId = setTimeout(() => {
                void refetchFolders();
                // Если открыта конкретная папка, обновляем и её данные
                if (currentFolderId !== null) {
                    void refetchFolder();
                }
            }, 100);
            
            return () => {
                clearTimeout(timeoutId);
            };
        }
    }, [isDirty, foldersLoading, currentFolderId, refetchFolders, refetchFolder]);

    const [allFolders, setAllFolders] = useState<Folder[]>([]);
    const [allPlaylists, setAllPlaylists] = useState<Playlist[]>([]);

    // Функция для рекурсивного поиска всех папок и коллекций в структуре (для поиска)
    const getAllItemsFromStructure = useCallback((folders: typeof foldersData): { folders: Folder[], playlists: Playlist[] } => {
        if (!folders || !Array.isArray(folders)) {
            return { folders: [], playlists: [] };
        }

        const allFoldersList: Folder[] = [];
        const allPlaylistsList: Playlist[] = [];

        const traverse = (folderList: typeof folders) => {
            for (const folder of folderList) {
                // Добавляем папку (кроме Root)
                if (folder.parentFolderId !== null && folder.parentFolderId !== undefined) {
                    const subFolderCount = Array.isArray(folder.subFolders) ? folder.subFolders.length : 0;
                    const collectionCount = Array.isArray(folder.collections) ? folder.collections.length : 0;
                    allFoldersList.push({
                        id: String(folder.id),
                        name: folder.name,
                        itemCount: subFolderCount + collectionCount,
                    });
                }

                // Добавляем коллекции
                if (Array.isArray(folder.collections)) {
                    folder.collections.forEach(collection => {
                        allPlaylistsList.push({
                            id: String(collection.id),
                            name: collection.name,
                            coverImage: getImageUrlById(collection.coverId),
                            type: collection.type,
                        });
                    });
                }

                // Рекурсивно обходим subFolders, если они полные FolderDTO
                if (Array.isArray(folder.subFolders) && folder.subFolders.length > 0) {
                    const firstSubFolder = folder.subFolders[0] as any;
                    if (firstSubFolder && (firstSubFolder.subFolders !== undefined || firstSubFolder.collections !== undefined)) {
                        traverse(folder.subFolders as any);
                    }
                }
            }
        };

        traverse(folders);
        return { folders: allFoldersList, playlists: allPlaylistsList };
    }, []);

    // Фильтрация данных по поисковому запросу
    // Если есть поисковый запрос, используем данные из общей структуры
    // Иначе используем данные из текущей папки или корневой
    const folders = useMemo(() => {
        if (searchQuery.trim()) {
            // Для поиска используем всю структуру
            const { folders: searchFolders } = getAllItemsFromStructure(foldersData);
            const query = searchQuery.toLowerCase().trim();
            return searchFolders.filter(folder => 
                folder.name.toLowerCase().includes(query)
            );
        }
        return allFolders;
    }, [allFolders, searchQuery, foldersData, getAllItemsFromStructure]);

    const playlists = useMemo(() => {
        if (searchQuery.trim()) {
            // Для поиска используем всю структуру
            const { playlists: searchPlaylists } = getAllItemsFromStructure(foldersData);
            const query = searchQuery.toLowerCase().trim();
            return searchPlaylists.filter(playlist => 
                playlist.name.toLowerCase().includes(query)
            );
        }
        return allPlaylists;
    }, [allPlaylists, searchQuery, foldersData, getAllItemsFromStructure]);

    // Обработка данных для корневой папки
    // Root папка (parentFolderId === null) скрывается от пользователя
    // Её subFolders и collections отображаются как корневые элементы
    useEffect(() => {
        if (foldersData && Array.isArray(foldersData) && currentFolderId === null) {
            // Находим Root папку (где parentFolderId === null)
            const rootFolder = foldersData.find(f => f.parentFolderId === null || f.parentFolderId === undefined);
            
            if (rootFolder) {
                // Преобразуем subFolders Root в формат Folder
                // subFolders могут быть либо SubFolderDTO[], либо FolderDTO[] (рекурсивная структура)
                const rootSubFolders: Folder[] = (rootFolder.subFolders || []).map((subFolder: any) => {
                    // Если это полный FolderDTO (рекурсивная структура)
                    if (subFolder.subFolders !== undefined || subFolder.collections !== undefined) {
                        const subFolderCount = Array.isArray(subFolder.subFolders) ? subFolder.subFolders.length : 0;
                        const collectionCount = Array.isArray(subFolder.collections) ? subFolder.collections.length : 0;
                        return {
                            id: String(subFolder.id),
                            name: subFolder.name,
                            itemCount: subFolderCount + collectionCount,
                        };
                    } else {
                        // Это SubFolderDTO
                        return {
                            id: String(subFolder.id),
                            name: subFolder.name,
                            itemCount: (subFolder.collectionCount || 0) + (subFolder.subFolderCount || 0),
                        };
                    }
                });
                
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
                setAllFolders(rootSubFolders);
                setAllPlaylists(rootCollections);
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
                
                setAllFolders(allFolders);
                setAllPlaylists(allCollections);
            }
        } else if (currentFolderId === null && foldersData && !Array.isArray(foldersData)) {
            // Если данные не являются массивом, очищаем состояние
            console.error('[Library] foldersData is not an array:', foldersData);
            setAllFolders([]);
            setAllPlaylists([]);
        } else if (currentFolderId === null && !foldersLoading && !foldersData) {
            // Если данных нет и загрузка завершена, очищаем состояние
            setAllFolders([]);
            setAllPlaylists([]);
        }
    }, [foldersData, currentFolderId, foldersLoading]);

    // Очистка данных при переходе на другую папку
    useEffect(() => {
        if (currentFolderId !== null) {
            // Очищаем данные сразу при переходе на другую папку
            setAllFolders([]);
            setAllPlaylists([]);
            // Очищаем поисковый запрос при переходе в подпапку
            setSearchQuery('');
        }
    }, [currentFolderId]);

    // Обработка данных для конкретной папки - используем запрос к API
    useEffect(() => {
        if (folderData && currentFolderId !== null) {
            // Преобразуем subFolders в формат Folder
            const subFolders: Folder[] = (folderData.subFolders || []).map((subFolder) => ({
                id: String(subFolder.id),
                name: subFolder.name,
                itemCount: (subFolder.collectionCount || 0) + (subFolder.subFolderCount || 0),
            }));
            
            // Преобразуем collections в формат Playlist
            const collections: Playlist[] = (folderData.collections || []).map((collection) => ({
                id: String(collection.id),
                name: collection.name,
                coverImage: getImageUrlById(collection.coverId),
                type: collection.type,
            }));
            
            setAllFolders(subFolders);
            setAllPlaylists(collections);
        } else if (currentFolderId !== null && !folderLoading && !folderData && folderError) {
            // Если загрузка завершилась с ошибкой, оставляем данные пустыми
            setAllFolders([]);
            setAllPlaylists([]);
        }
    }, [folderData, currentFolderId, folderLoading, folderError]);

    // Удален useEffect с refetchFolders, так как теперь запросы управляются через isDirty флаг

    const handleFolderClick = useCallback((folder: Folder) => {
        setCurrentFolderId(Number(folder.id));
    }, []);

    const handleBack = useCallback(() => {
        // Переходим к родительской папке, если она есть и не является Root, иначе в корень
        if (folderData && folderData.parentFolderId !== null && folderData.parentFolderId !== undefined) {
            // Проверяем, не является ли родительская папка Root (системной папкой)
            // Root папка имеет parentFolderId === null
            // Если родительская папка - Root, переходим в корень
            if (foldersData && Array.isArray(foldersData)) {
                const parentFolder = foldersData.find(f => f.id === folderData.parentFolderId);
                // Если родительская папка - Root (parentFolderId === null), переходим в корень
                if (parentFolder && (parentFolder.parentFolderId === null || parentFolder.parentFolderId === undefined)) {
                    setCurrentFolderId(null);
                } else {
                    // Иначе переходим к родительской папке
                    setCurrentFolderId(folderData.parentFolderId);
                }
            } else {
                // Если не можем проверить, переходим к родительской папке
                setCurrentFolderId(folderData.parentFolderId);
            }
        } else {
            // Если нет родительской папки, переходим в корень
            setCurrentFolderId(null);
        }
    }, [folderData, foldersData]);

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

    const handleSearch = useCallback((value: string) => {
        setSearchQuery(value);
    }, []);

    // Вспомогательная функция для проверки, является ли папка дочерней (рекурсивно)
    const isChildFolder = useCallback((parentFolderId: number, childFolderId: number, allFolders: typeof foldersData): boolean => {
        if (!allFolders || !Array.isArray(allFolders)) return false;
        
        const parentFolder = allFolders.find(f => f.id === parentFolderId);
        if (!parentFolder) return false;
        
        // Проверяем прямых потомков
        if (parentFolder.subFolders.some(sf => sf.id === childFolderId)) {
            return true;
        }
        
        // Рекурсивно проверяем всех потомков
        return parentFolder.subFolders.some(subFolder => {
            const fullSubFolder = allFolders.find(f => f.id === subFolder.id);
            if (fullSubFolder) {
                return isChildFolder(fullSubFolder.id, childFolderId, allFolders);
            }
            return false;
        });
    }, []);

    const handleDrop = useCallback(async (dropInfo: DropInfo) => {
        const { draggedItem, targetFolderId, moveToParent } = dropInfo;
        
        // Определяем фактическую целевую папку
        let finalTargetFolderId: number | null = targetFolderId;
        
        if (moveToParent) {
            // Если перетаскивание вверх, используем родительскую папку
            if (currentFolderId !== null && folderData) {
                // Если мы находимся внутри папки, используем её parentFolderId
                finalTargetFolderId = folderData.parentFolderId ?? null;
            } else if (foldersData && Array.isArray(foldersData)) {
                // Если мы в корне, ищем папку с targetFolderId и берём её parentFolderId
                const targetFolder = foldersData.find(f => f.id === targetFolderId);
                if (targetFolder) {
                    finalTargetFolderId = targetFolder.parentFolderId ?? null;
                } else {
                    // Если не нашли папку в корне, ищем в рекурсивной структуре
                    const findFolderInStructure = (folders: typeof foldersData, id: number): typeof foldersData[0] | null => {
                        for (const folder of folders) {
                            if (folder.id === id) return folder;
                            if (Array.isArray(folder.subFolders) && folder.subFolders.length > 0) {
                                const firstSubFolder = folder.subFolders[0] as any;
                                if (firstSubFolder && (firstSubFolder.subFolders !== undefined || firstSubFolder.collections !== undefined)) {
                                    const found = findFolderInStructure(folder.subFolders as any, id);
                                    if (found) return found;
                                }
                            }
                        }
                        return null;
                    };
                    const foundFolder = findFolderInStructure(foldersData, targetFolderId);
                    if (foundFolder) {
                        finalTargetFolderId = foundFolder.parentFolderId ?? null;
                    }
                }
            }
        }
        
        // Если finalTargetFolderId === null, это означает корневую папку
        // Для API нужно передать null или специальное значение
        // Проверяем, является ли коллекция favorites
        if (draggedItem.type === 'collection') {
            const collectionName = draggedItem.name?.toLowerCase().trim();
            if (collectionName === 'favorites' || collectionName === 'избранное') {
                showError('Cannot move favorites collection', ['The favorites collection cannot be moved to folders']);
                return;
            }
        }

        // Предотвращаем перетаскивание папки в саму себя
        if (draggedItem.type === 'folder' && draggedItem.id === finalTargetFolderId) {
            console.warn('Cannot move folder into itself');
            showError('Cannot move folder', ['You cannot move a folder into itself']);
            return;
        }

        // Предотвращаем циклические ссылки - проверяем, что целевая папка не является дочерней
        if (draggedItem.type === 'folder' && foldersData && finalTargetFolderId !== null) {
            if (isChildFolder(draggedItem.id, finalTargetFolderId, foldersData)) {
                console.warn('Cannot move folder into its child folder');
                showError('Cannot move folder', ['You cannot move a folder into its child folder']);
                return;
            }
        }

        // Если finalTargetFolderId === null, нужно найти root folder id
        if (finalTargetFolderId === null) {
            if (foldersData && Array.isArray(foldersData)) {
                const rootFolder = foldersData.find(f => f.parentFolderId === null || f.parentFolderId === undefined);
                if (rootFolder) {
                    finalTargetFolderId = rootFolder.id;
                } else {
                    showError('Cannot move to root', ['Root folder not found']);
                    return;
                }
            } else {
                showError('Cannot move to root', ['Library structure not loaded']);
                return;
            }
        }

        try {
            if (draggedItem.type === 'collection') {
                await moveCollectionToFolder({
                    collectionId: draggedItem.id,
                    targetFolderId: finalTargetFolderId,
                }).unwrap();
            } else if (draggedItem.type === 'folder') {
                await moveFolder({
                    folderId: draggedItem.id,
                    newParentFolderId: finalTargetFolderId,
                }).unwrap();
            }
            
            // Немедленно обновляем данные библиотеки
            await refetchFolders();
            // Если открыта конкретная папка, обновляем и её данные
            if (currentFolderId !== null && refetchFolder) {
                await refetchFolder();
            }
        } catch (error: any) {
            console.error('Error during drag-and-drop:', error);
            const errorMessage = error?.data?.message || error?.message || 'Failed to move item';
            const errors = error?.data?.errors || [errorMessage];
            showError(errorMessage, errors);
        }
    }, [moveCollectionToFolder, moveFolder, foldersData, isChildFolder, showError, currentFolderId, folderData, refetchFolders, refetchFolder]);

    const sections = useMemo<ContentSection[]>(() => [
        {
            id: 'folders',
            title: 'Folders',
            countLabel: 'folders',
            shouldShow: selectedCategory === 'All',
            items: folders,
            className: styles.foldersSection,
            renderItem: (folder: unknown) => {
                const folderItem = folder as Folder;
                return (
                    <FolderCard
                        key={folderItem.id}
                        label={folderItem.name}
                        folderId={Number(folderItem.id)}
                        onClick={() => handleFolderClick(folderItem)}
                        onDrop={(dropInfo) => handleDrop(dropInfo)}
                    />
                );
            }
        },
        {
            id: 'playlists',
            title: 'Playlists',
            countLabel: 'playlists',
            shouldShow: selectedCategory === 'All' || selectedCategory === 'Playlists',
            items: playlists,
            renderItem: (playlist: unknown) => {
                const playlistItem = playlist as Playlist;
                return (
                    <ItemCard
                        key={playlistItem.id}
                        size="small"
                        image={playlistItem.coverImage}
                        textContent={{
                            title: playlistItem.name,
                            subtitle1: playlistItem.description
                        }}
                        to={`/playlist/${playlistItem.id}`}
                        onClick={() => handlePlaylistClick(playlistItem)}
                        collectionId={Number(playlistItem.id)}
                        collectionName={playlistItem.name}
                    />
                );
            }
        }
    ], [selectedCategory, folders, playlists, handleFolderClick, handlePlaylistClick, handleDrop]);

    // Определяем заголовок: название текущей папки или "Library"
    const headerTitle = currentFolderId !== null && folderData 
        ? folderData.name 
        : 'Library';

    // Определяем состояние загрузки
    const isLoading = currentFolderId === null ? foldersLoading : folderLoading;

    // Отслеживаем начало перетаскивания и позицию курсора глобально
    useEffect(() => {
        if (currentFolderId === null) return; // Зона показывается только внутри папки
        
        const handleDragStart = () => {
            isDraggingRef.current = true;
        };
        
        const handleDragEnd = () => {
            isDraggingRef.current = false;
            setIsDraggingOverTopZone(false);
        };
        
        const handleDragOver = (e: DragEvent) => {
            if (!isDraggingRef.current) return;
            
            // Проверяем, находится ли курсор в верхних 10% viewport
            const viewportHeight = window.innerHeight;
            const topZoneHeight = viewportHeight * 0.1;
            
            if (e.clientY < topZoneHeight) {
                setIsDraggingOverTopZone(true);
            } else {
                setIsDraggingOverTopZone(false);
            }
        };
        
        document.addEventListener('dragstart', handleDragStart);
        document.addEventListener('dragend', handleDragEnd);
        document.addEventListener('dragover', handleDragOver);
        
        return () => {
            document.removeEventListener('dragstart', handleDragStart);
            document.removeEventListener('dragend', handleDragEnd);
            document.removeEventListener('dragover', handleDragOver);
        };
    }, [currentFolderId]);

    // Обработчики для зоны drop в верхней части страницы
    const handleTopZoneDragOver = useCallback((e: React.DragEvent) => {
        if (!isDraggingRef.current) return;
        e.preventDefault();
        e.stopPropagation();
        e.dataTransfer.dropEffect = 'move';
        setIsDraggingOverTopZone(true);
    }, []);

    const handleTopZoneDragLeave = useCallback((e: React.DragEvent) => {
        // Проверяем, что мы действительно покинули зону
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX;
        const y = e.clientY;
        if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
            setIsDraggingOverTopZone(false);
        }
    }, []);

    const handleTopZoneDrop = useCallback(async (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDraggingOverTopZone(false);
        
        try {
            const data = e.dataTransfer.getData('application/json');
            if (data) {
                const draggedItem = JSON.parse(data);
                
                // Определяем родительскую папку
                let finalTargetFolderId: number | null = null;
                
                if (currentFolderId !== null && folderData) {
                    // Если мы находимся внутри папки, используем её parentFolderId
                    finalTargetFolderId = folderData.parentFolderId ?? null;
                } else if (foldersData && Array.isArray(foldersData)) {
                    // Если мы в корне, то finalTargetFolderId остается null (будет использован root folder id)
                    finalTargetFolderId = null;
                }
                
                // Проверяем, является ли коллекция favorites
                if (draggedItem.type === 'collection') {
                    const collectionName = draggedItem.name?.toLowerCase().trim();
                    if (collectionName === 'favorites' || collectionName === 'избранное') {
                        showError('Cannot move favorites collection', ['The favorites collection cannot be moved to folders']);
                        return;
                    }
                }

                // Если finalTargetFolderId === null, нужно найти root folder id
                if (finalTargetFolderId === null) {
                    if (foldersData && Array.isArray(foldersData)) {
                        const rootFolder = foldersData.find(f => f.parentFolderId === null || f.parentFolderId === undefined);
                        if (rootFolder) {
                            finalTargetFolderId = rootFolder.id;
                        } else {
                            showError('Cannot move to root', ['Root folder not found']);
                            return;
                        }
                    } else {
                        showError('Cannot move to root', ['Library structure not loaded']);
                        return;
                    }
                }

                // Предотвращаем перетаскивание папки в саму себя
                if (draggedItem.type === 'folder' && draggedItem.id === finalTargetFolderId) {
                    console.warn('Cannot move folder into itself');
                    showError('Cannot move folder', ['You cannot move a folder into itself']);
                    return;
                }

                // Предотвращаем циклические ссылки
                if (draggedItem.type === 'folder' && foldersData) {
                    if (isChildFolder(draggedItem.id, finalTargetFolderId, foldersData)) {
                        console.warn('Cannot move folder into its child folder');
                        showError('Cannot move folder', ['You cannot move a folder into its child folder']);
                        return;
                    }
                }

                // Выполняем перемещение
                if (draggedItem.type === 'collection') {
                    await moveCollectionToFolder({
                        collectionId: draggedItem.id,
                        targetFolderId: finalTargetFolderId,
                    }).unwrap();
                } else if (draggedItem.type === 'folder') {
                    await moveFolder({
                        folderId: draggedItem.id,
                        newParentFolderId: finalTargetFolderId,
                    }).unwrap();
                }
                
                // Немедленно обновляем данные библиотеки
                await refetchFolders();
                // Обновляем данные текущей папки
                if (currentFolderId !== null && refetchFolder) {
                    await refetchFolder();
                }
            }
        } catch (error: any) {
            console.error('Error during drag-and-drop in top zone:', error);
            const errorMessage = error?.data?.message || error?.message || 'Failed to move item';
            const errors = error?.data?.errors || [errorMessage];
            showError(errorMessage, errors);
        }
    }, [currentFolderId, folderData, foldersData, moveCollectionToFolder, moveFolder, isChildFolder, showError, refetchFolders, refetchFolder]);

    return (
        <div className={styles.container}>
            {/* Зона drop в верхней части страницы (верхние 10%) */}
            {currentFolderId !== null && (
                <div
                    className={`${styles.topDropZone} ${isDraggingOverTopZone ? styles.topDropZoneActive : ''}`}
                    onDragOver={handleTopZoneDragOver}
                    onDragLeave={handleTopZoneDragLeave}
                    onDrop={handleTopZoneDrop}
                />
            )}
            <div className={styles.headerContainer}>
    <div className={styles.headerInner}>
        {currentFolderId !== null && (
            <Button
                variant="filled"
                theme="dark"
                size="medium"
                shape="cr-16"
                iconOnly
                icon={<LeftArrow />}
                onClick={handleBack}
                className={styles.backButton}
            />
        )}
        <SearchFilterHeader
            title={headerTitle}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            categories={['All', 'Albums', 'Playlists', 'Artists']}
            searchValue={searchQuery}
            onSearch={handleSearch}
            showSearch={currentFolderId === null}
        />
    </div>
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
            {isLoading ? (
                <LibrarySkeleton />
            ) : (
                <ContentSections sections={sections} />
            )}
        </div>
    );
};
