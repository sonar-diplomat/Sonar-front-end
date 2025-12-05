import React from 'react';
import { ItemCard } from '@shared/ui';
import type { ContentSection } from '@widgets/ContentSections';
import type { Playlist } from '@pages/Library';

export const createPlaylistSection = (playlists: Playlist[]): ContentSection<Playlist> => {
    return {
        id: 'playlists',
        title: 'Public Playlists',
        countLabel: 'Playlists',
        items: playlists,
        shouldShow: true,
        renderItem: (playlist: Playlist) => (
            <ItemCard
                key={playlist.id}
                image={playlist.coverImage}
                textContent={{
                    title: playlist.name,
                    subtitle1: playlist.description
                }}
                to={`/collection/${playlist.id}`}
                state={{ collectionType: playlist.type || 'Playlist' }}
            />
        ),
    };
};