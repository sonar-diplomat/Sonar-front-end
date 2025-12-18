import React, {useState, useRef} from 'react';
import styles from './CreatePlaylist.module.css';
import {Button, Input, PlusIcon, LeftArrow, LoadingImage} from "@shared/ui";
import {useNavigate, useLocation} from 'react-router-dom';
import { useCreatePlaylistMutation, useAddCollectionToFolderMutation } from '@shared/api';

export interface CreatePlaylistProps {
    className?: string;
}

export const CreatePlaylist: React.FC<CreatePlaylistProps> = ({className = ''}) => {
    const navigate = useNavigate();
    const location = useLocation();
    const parentFolderId = location.state?.parentFolderId as number | undefined;
    const [playlistName, setPlaylistName] = useState('My Playlist #1');
    const [coverFile, setCoverFile] = useState<File | null>(null);
    const [coverPreview, setCoverPreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [createPlaylist, { isLoading, error }] = useCreatePlaylistMutation();
    const [addCollectionToFolder] = useAddCollectionToFolderMutation();

    const handleBack = () => {
        navigate(-1);
    };

    const handleAddPhoto = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setCoverFile(file);
            // Создаем превью для отображения
            const reader = new FileReader();
            reader.onloadend = () => {
                setCoverPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleCreatePlaylist = async () => {
        if (!playlistName.trim()) {
            console.warn('Playlist name cannot be empty');
            return;
        }

        try {
            const result = await createPlaylist({
                name: playlistName.trim(),
                cover: coverFile || null,
            }).unwrap();
            
            console.log('Playlist created successfully:', result);
            
            // Если есть parentFolderId, добавляем плейлист в папку
            if (parentFolderId && result.id) {
                try {
                    await addCollectionToFolder({
                        folderId: parentFolderId,
                        collectionId: result.id
                    }).unwrap();
                    console.log('Playlist added to folder successfully');
                } catch (err) {
                    console.error('Failed to add playlist to folder:', err);
                    // Не прерываем процесс, плейлист уже создан
                }
            }
            
            // Переходим обратно в библиотеку после успешного создания
            navigate('/library');
        } catch (err) {
            console.error('Failed to create playlist:', err);
        }
    };

    // Render 9 empty content squares
    // const renderContentGrid = () => {
    //     return (
    //         <div className={styles.contentGrid}>
    //             {[...Array(9)].map((_, index) => (
    //                 <div key={index} className={styles.contentSquare} />
    //             ))}
    //         </div>
    //     );
    // };

    return (
        <div className={`${styles.container} ${className}`}>
            <div className={styles.header}>
                <Button
                    variant="filled"
                    theme="dark"
                    size="medium"
                    shape="cr-16"
                    iconOnly
                    icon={<LeftArrow/>}
                    onClick={handleBack}
                    className={styles.backButton}
                />
                <h1 className={styles.title}>Create new playlist</h1>
            </div>

            <div className={styles.content}>
                <div className={styles.welcomeSection}>
                    <h2 className={styles.welcomeTitle}>Name your playlist</h2>
                    <p className={styles.welcomeDescription}>
                        Give your playlist a name and add a cover image to make it unique.
                    </p>
                </div>

                <div className={styles.inputSection}>
                    <Input
                        type="text"
                        value={playlistName}
                        onChange={(e) => setPlaylistName(e.target.value)}
                        placeholder="Playlist name"
                        className={styles.playlistInput}
                    />
                </div>

                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                />

                {coverPreview && (
                    <div style={{ marginBottom: '16px', textAlign: 'center' }}>
                        <LoadingImage
                            src={coverPreview}
                            alt="Cover preview" 
                            style={{ 
                                maxWidth: '200px', 
                                maxHeight: '200px', 
                                borderRadius: '8px',
                                objectFit: 'cover'
                            }} 
                        />
                    </div>
                )}

                <Button
                    variant="filled"
                    theme="dark"
                    size="large"
                    shape="cr-32"
                    icon={<PlusIcon/>}
                    onClick={handleAddPhoto}
                    className={styles.addPhotoButton}
                >
                    {coverFile ? 'Change photo' : 'Add photo'}
                </Button>

                {/*<div className={styles.firstContentSection}>*/}
                {/*    <h3 className={styles.sectionTitle}>Add your first content</h3>*/}
                {/*    <p style={{ fontSize: '14px', color: 'var(--text-color-secondary)', marginBottom: '16px' }}>*/}
                {/*        You can add tracks to your playlist after creating it.*/}
                {/*    </p>*/}
                {/*    {renderContentGrid()}*/}
                {/*</div>*/}

                {error && (
                    <div style={{ color: 'red', marginBottom: '16px', padding: '8px' }}>
                        Error: {error && 'data' in error && error.data && 'message' in error.data 
                            ? String(error.data.message) 
                            : 'Failed to create playlist'}
                    </div>
                )}

                <Button
                    variant="filled"
                    theme="light"
                    size="large"
                    shape="cr-16"
                    onClick={handleCreatePlaylist}
                    disabled={isLoading || !playlistName.trim()}
                    className={styles.createFolderButton}
                >
                    {isLoading ? 'Creating...' : 'Create playlist'}
                </Button>
            </div>
        </div>
    );
};