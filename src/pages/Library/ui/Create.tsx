import React from 'react';
import styles from './Create.module.css';
import {Button, PlusIcon} from "@shared/ui";
import {LeftArrow} from "@shared/ui";
import {useNavigate} from 'react-router-dom';

export interface CreateProps {
    className?: string;
}

export const Create: React.FC<CreateProps> = ({className = ''}) => {
    const navigate = useNavigate();

    const handleBack = () => {
        navigate(-1);
    };

    const handleCreatePlaylist = () => {
        console.log('Creating playlist');
        navigate('/library/create/playlist');
    };

    const handleCreateBlend = () => {
        console.log('Creating blend');
        // TODO: Navigate to blend creation
    };

    const handleCreateFolder = () => {
        console.log('Creating folder');
        navigate('/library/create/folder');
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
                <h1 className={styles.title}>Create new</h1>
            </div>

            <div className={styles.optionsContainer}>
                <div className={styles.optionWrapper}>
                    <Button
                        variant="filled"
                        theme="dark"
                        size="large"
                        shape="cr-32"
                        icon={<PlusIcon/>}
                        onClick={handleCreatePlaylist}
                        className={styles.optionButton}
                    >
                        Playlist
                    </Button>
                    <p className={styles.optionDescription}>
                        Make your playlist and enjoy your favorite tunes anytime! Click the button below to start.
                    </p>
                </div>

                <div className={styles.optionWrapper}>
                    <Button
                        variant="filled"
                        theme="dark"
                        size="large"
                        shape="cr-32"
                        icon={<PlusIcon/>}
                        onClick={handleCreateBlend}
                        className={styles.optionButton}
                    >
                        Blend
                    </Button>
                    <p className={styles.optionDescription}>
                        Blend your music! This feature merges your tastes with a friend's to create a playlist for discovering new favorites.
                    </p>
                </div>

                <div className={styles.optionWrapper}>
                    <Button
                        variant="filled"
                        theme="dark"
                        size="large"
                        shape="cr-32"
                        icon={<PlusIcon/>}
                        onClick={handleCreateFolder}
                        className={styles.optionButton}
                    >
                        Folder
                    </Button>
                    <p className={styles.optionDescription}>
                        Create a folder for your playlists and albums to organize your music and keep your favorite tracks safe.
                    </p>
                </div>
            </div>
        </div>
    );
};