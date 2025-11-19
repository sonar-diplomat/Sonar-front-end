import React, {useState} from 'react';
import styles from './CreatePlaylist.module.css';
import {Button, Input, PlusIcon, LeftArrow} from "@shared/ui";
import {useNavigate} from 'react-router-dom';

export interface CreatePlaylistProps {
    className?: string;
}

export const CreatePlaylist: React.FC<CreatePlaylistProps> = ({className = ''}) => {
    const navigate = useNavigate();
    const [playlistName, setPlaylistName] = useState('My Playlist #1');

    const handleBack = () => {
        navigate(-1);
    };

    const handleAddPhoto = () => {
        console.log('Add photo clicked');
        // TODO: Implement photo upload
    };

    const handleCreateFolder = () => {
        console.log('Create folder clicked');
        // TODO: Navigate to create folder or submit playlist
    };

    // Render 9 empty content squares
    const renderContentGrid = () => {
        return (
            <div className={styles.contentGrid}>
                {[...Array(9)].map((_, index) => (
                    <div key={index} className={styles.contentSquare} />
                ))}
            </div>
        );
    };

    return (
        <div className={`${styles.container} ${className}`}>
            <div className={styles.header}>
                <Button
                    variant="dark"
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
                    <h2 className={styles.welcomeTitle}>Invite friends!</h2>
                    <p className={styles.welcomeDescription}>
                        Blend is a unique feature that automatically creates a personalized playlist by combining your musical tastes with a friend's. Just share a link and let the music flow!
                    </p>
                </div>

                <div className={styles.inputSection}>
                    <Input
                        type="text"
                        value={playlistName}
                        onChange={(e) => setPlaylistName(e.target.value)}
                        className={styles.playlistInput}
                    />
                </div>

                <Button
                    variant="dark"
                    size="large"
                    shape="cr-32"
                    icon={<PlusIcon/>}
                    onClick={handleAddPhoto}
                    className={styles.addPhotoButton}
                >
                    Add photo
                </Button>

                <div className={styles.firstContentSection}>
                    <h3 className={styles.sectionTitle}>Add your first content</h3>
                    {renderContentGrid()}
                </div>

                <Button
                    variant="light"
                    size="large"
                    shape="cr-16"
                    onClick={handleCreateFolder}
                    className={styles.createFolderButton}
                >
                    Create folder
                </Button>
            </div>
        </div>
    );
};