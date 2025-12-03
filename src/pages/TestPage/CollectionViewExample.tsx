import React from 'react';
import { CollectionView, CollectionHeader, CollectionCover, CollectionActions } from '@widgets/CollectionView';
import type { Track } from '@widgets/CollectionView';

const exampleTracks: Track[] = [
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
];

export const CollectionViewExample: React.FC = () => {
    const handleTrackMenuClick = (trackId: string) => {
        console.log('Menu clicked for track:', trackId);
    };

    const handleBackClick = () => {
        console.log('Back button clicked');
        // Navigate back or handle back action
    };

    const handleHeaderMenuClick = () => {
        console.log('Header menu clicked');
        // Open collection menu
    };

    const handlePlayClick = () => {
        console.log('Play clicked');
        // Start playing the collection
    };

    const handleShuffleClick = () => {
        console.log('Shuffle clicked');
        // Shuffle and play the collection
    };

    const handleAddClick = () => {
        console.log('Add clicked');
    };

    const handleEditClick = () => {
        console.log('Edit clicked');
    };

    const handleSortClick = () => {
        console.log('Sort clicked');
    };

    const handleEditPlaylistClick = () => {
        console.log('Edit playlist clicked');
    };

    return (
        <div style={{
            minHeight: '100vh',
            background: '#0D0D0D',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
        }}>
            <CollectionHeader
                title="Your mix"
                onBackClick={handleBackClick}
                onMenuClick={handleHeaderMenuClick}
            />
            <CollectionCover
                size={346}
                onPlayClick={handlePlayClick}
                onShuffleClick={handleShuffleClick}
                // imageSrc="" add cover image
            />
            <CollectionActions
                onAddClick={handleAddClick}
                onEditClick={handleEditClick}
                onSortClick={handleSortClick}
                onEditPlaylistClick={handleEditPlaylistClick}
            />
            <CollectionView
                title="Tracks inside"
                tracks={exampleTracks}
                onTrackMenuClick={handleTrackMenuClick}
            />
        </div>
    );
};