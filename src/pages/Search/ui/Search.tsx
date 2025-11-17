import React, {useState, useMemo, useCallback} from 'react';

import {useNavigate} from 'react-router-dom';

import type {Playlist} from "@pages/Library";
import {ItemCard} from "@shared/ui";
import type {Category} from "@widgets/ChipsBar";
import {ContentSections, type ContentSection} from "@widgets/ContentSections";
import {SearchFilterHeader} from "@widgets/SearchFilterHeader";

import styles from './Search.module.css';

export const Search: React.FC = () => {
    const navigate = useNavigate();
    const [selectedCategory, setSelectedCategory] = useState<Category>('All');


    const [playlists, setPlaylists] = useState<Playlist[]>([
        {id: '1', name: 'Playlist 1'},
        {id: '2', name: 'Playlist 2'},
        {id: '3', name: 'Playlist 3'},
        {id: '4', name: 'Playlist 4'}
    ]);


    const handlePlaylistClick = useCallback((playlist: Playlist) => {
        console.log('Opening playlist:', playlist);
        // TODO: Navigate to playlist page
        // navigate(`/playlist/${playlist.id}`);
    }, []);

    // Define sections
    const sections = useMemo<ContentSection[]>(() => [
        {
            id: 'playlists',
            title: 'Playlists',
            countLabel: 'playlists',
            shouldShow: selectedCategory === 'All' || selectedCategory === 'Playlists',
            items: playlists,
            renderItem: (playlist: Playlist) => (
                <ItemCard
                    size="large"
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
    ], [selectedCategory, playlists, handlePlaylistClick]);

    return (
        <div className={styles.container}>
            <SearchFilterHeader
                title="Search"
                selectedCategory={selectedCategory}
                onCategoryChange={setSelectedCategory}
            />
            <ContentSections sections={sections} />
        </div>
    );
};
