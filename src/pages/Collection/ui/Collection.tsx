import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from './Collection.module.css';
import { CollectionHeader, CollectionCover, CollectionView, CollectionActions } from '@widgets/CollectionView';
import type { Track } from '@widgets/CollectionView';

export const Collection: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const collectionData = {
        title: 'Your mix',
        coverImage: undefined, // Add image URL
        tracks: [
            {
                id: '1',
                title: 'Whispers of the Dreamscape',
                artist: 'Echo Night',
            },
            {
                id: '2',
                title: 'Voices from the Heart',
                artist: 'Sienna Bloom',
            },
            {
                id: '3',
                title: 'Harmonies of Reflection',
                artist: 'Jasper Voss',
            },
            {
                id: '4',
                title: 'Artists of Awareness',
                artist: 'Slate Rivers',
            },
            {
                id: '5',
                title: 'Tunes of Introspection',
                artist: 'Finn Chord',
            },
            {
                id: '6',
                title: 'Serenades of Peace',
                artist: 'Zylo Vibe',
            },
            {
                id: '7',
                title: 'Singers of Insight',
                artist: 'Echo Pulse',
            },
            {
                id: '8',
                title: 'Collective Calm',
                artist: 'Ryder Wave',
            },
            {
                id: '9',
                title: 'Harmonies of Thoughtfulness',
                artist: 'Nova Beat',
            },
            {
                id: '10',
                title: 'Artists of Contemplation',
                artist: 'Kairo Synth',
            },
            {
                id: '11',
                title: 'Singers of Reflection',
                artist: 'Luna Groove',
            },
            {
                id: '12',
                title: 'Creators of Awareness',
                artist: 'Axel Rhythm',
            },
        ] as Track[],
    };

    const handleBackClick = () => {
        console.log('Back clicked - navigate to previous page');
        navigate(-1); // Go back to previous page
    };

    const handleMenuClick = () => {
        console.log('Menu clicked - open collection options');
        // Open a menu with options like: Share, Add to playlist, Delete, etc.
    };

    const handlePlayClick = () => {
        console.log('Play clicked - start playing collection');
        // Start playing all tracks in order
    };

    const handleShuffleClick = () => {
        console.log('Shuffle clicked - shuffle and play');
        // Shuffle tracks and start playing
    };

    const handleTrackMenuClick = (trackId: string) => {
        console.log('Track menu clicked:', trackId);
    };

    const handleAddClick = () => {
        console.log('Add clicked - add tracks to collection');
        // Open dialog to add tracks to this collection
    };

    const handleEditClick = () => {
        console.log('Edit clicked - edit collection details');
        // Open edit dialog for collection name, description, etc.
    };

    const handleSortClick = () => {
        console.log('Sort clicked - sort tracks');
        // Open sort menu: by name, artist, date added, etc.
    };


    return (
        <div className={styles.collection}>
            <CollectionHeader
                title={collectionData.title}
                onBackClick={handleBackClick}
                onMenuClick={handleMenuClick}
            />
            <CollectionCover
                imageSrc={collectionData.coverImage}
                onPlayClick={handlePlayClick}
                onShuffleClick={handleShuffleClick}
            />
            <CollectionActions
                onAddClick={handleAddClick}
                onEditClick={handleEditClick}
                onSortClick={handleSortClick}
            />
            <CollectionView
                title="Tracks inside"
                tracks={collectionData.tracks}
                onTrackMenuClick={handleTrackMenuClick}
            />
        </div>
    );
};