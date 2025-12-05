import React, {useState} from 'react';

import {useNavigate, useLocation} from 'react-router-dom';

import {Button, Input, LeftArrow} from "@shared/ui";
import { useCreateFolderMutation } from '@shared/api';

import styles from './CreateFolder.module.css';

export interface CreateFolderProps {
    className?: string;
}

export const CreateFolder: React.FC<CreateFolderProps> = ({className = ''}) => {
    const navigate = useNavigate();
    const location = useLocation();
    const parentFolderId = location.state?.parentFolderId as number | undefined;
    const [folderName, setFolderName] = useState('My folder #1');
    const [createFolder, { isLoading, error }] = useCreateFolderMutation();

    const handleBack = () => {
        navigate(-1);
    };

    const handleCreateFolder = async () => {
        if (!folderName.trim()) {
            console.warn('Folder name cannot be empty');
            return;
        }

        try {
            const result = await createFolder({
                name: folderName.trim(),
                parentFolderId: parentFolderId || undefined,
            }).unwrap();
            
            console.log('Folder created successfully:', result);
            // Переходим обратно в библиотеку после успешного создания
            navigate('/library');
        } catch (err) {
            console.error('Failed to create folder:', err);
        }
    };

    // Render 6 empty content squares (2 rows of 3)
    const renderContentGrid = () => {
        return (
            <div className={styles.contentGrid}>
                {[...Array(6)].map((_, index) => (
                    <div key={index} className={styles.contentSquare} />
                ))}
            </div>
        );
    };

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
                <h1 className={styles.title}>Create new folder</h1>
            </div>

            <div className={styles.content}>
                <div className={styles.welcomeSection}>
                    <h2 className={styles.welcomeTitle}>Name your folder</h2>
                    <p className={styles.welcomeDescription}>
                        The name and the folders will be visible only for you.
                    </p>
                </div>

                <div className={styles.inputSection}>
                    <Input
                        type="text"
                        value={folderName}
                        onChange={(e) => setFolderName(e.target.value)}
                        className={styles.folderInput}
                    />
                </div>

                <div className={styles.firstContentSection}>
                    <h3 className={styles.sectionTitle}>Add your first content</h3>
                    {renderContentGrid()}
                </div>

                {error && (
                    <div style={{ color: 'red', marginBottom: '16px', padding: '8px' }}>
                        Error: {error && 'data' in error && error.data && 'message' in error.data 
                            ? String(error.data.message) 
                            : 'Failed to create folder'}
                    </div>
                )}
                <Button
                    variant="filled"
                    theme="light"
                    size="large"
                    shape="cr-16"
                    onClick={handleCreateFolder}
                    disabled={isLoading || !folderName.trim()}
                    className={styles.createFolderButton}
                >
                    {isLoading ? 'Creating...' : 'Create folder'}
                </Button>
            </div>
        </div>
    );
};
