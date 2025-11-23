import React, {useMemo, useState} from 'react'
import {Button, ItemCard, MoreIcon, ProfileCard, UpRightArrow} from "@shared/ui";
import styles from './UserProfile.module.css'
import {ProfileHeader} from "@widgets/ProfileHeader";
import {type ContentSection, ContentSections} from "@widgets/ContentSections";
import {TopSongsWidget, type Song} from "@widgets/TopSongsWidget";
import {TopArtistsWidget, type Artist} from "@widgets/TopArtistsWidget";
import type {Playlist} from "@pages/Library";


export const UserProfile = () => {
    const [playlists] = useState<Playlist[]>([
        {id: '1', name: 'Playlist 1'},
        {id: '2', name: 'Playlist 2'},
        {id: '3', name: 'Playlist 3'},
        {id: '4', name: 'Playlist 4'}
    ]);

    const [topSongs] = useState<Song[]>([
        {id: '1', title: 'Whispers of the Dreamscape', artist: 'Moody', imageSrc: 'https://placehold.co/64x64'},
        {id: '2', title: 'Whispers of the Dreamscape', artist: 'Moody', imageSrc: 'https://placehold.co/64x64'},
        {id: '3', title: 'Whispers of the Dreamscape', artist: 'Moody', imageSrc: 'https://placehold.co/64x64'},
        {id: '4', title: 'Whispers of the Dreamscape', artist: 'Moody', imageSrc: 'https://placehold.co/64x64'},
        {id: '5', title: 'Whispers of the Dreamscape', artist: 'Moody', imageSrc: 'https://placehold.co/64x64'},
    ]);

    const [topArtists] = useState<Artist[]>([
        {id: '1', name: 'Moody', imageSrc: 'https://placehold.co/64x64'},
        {id: '2', name: 'Weekend', imageSrc: 'https://placehold.co/64x64'},
        {id: '3', name: 'Atro boy', imageSrc: 'https://placehold.co/64x64'},
        {id: '4', name: 'DOORFEEVA', imageSrc: 'https://placehold.co/64x64'},
        {id: '5', name: 'Negative', imageSrc: 'https://placehold.co/64x64'},
    ]);
    const sections = useMemo<ContentSection[]>(() => [
        {
            id: 'playlists',
            title: ' Public Playlists',
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
                />
            ),

        }
    ], []);
    return (
        <div className={styles.container}>
            <ProfileHeader/>
            <ProfileCard isVerified name={"Vannesa"} stats={{followers:125, following:16, publicPlaylists: 10}} src={"https://placehold.co/378x264"} alt={"profileImage"}/>
            <div className={styles.profileActions}>
                <Button size={"medium"} shape={"cr-16"} icon={<UpRightArrow/>} children={"Follow"} fullWidth/>
                <div className={styles.svgBox}>
                    <MoreIcon />
                </div>
            </div>
            <ContentSections sections={sections}/>
            <ProfileCard variant={"bio"} title={"Top 1% listener"} bio={"Curating playlists with 127 collections and counting 🎧 From morning coffee to late-night vibes, I have a soundtrack for every moment. Share your recommendations below 💌"} src={"https://placehold.co/378x264"} alt={"profileImage"}/>

            <TopSongsWidget
                songs={topSongs}
                dateRange="Nov 10 –16"
                onSongMenuClick={(songId) => console.log('Menu clicked for song:', songId)}
            />

            <TopArtistsWidget
                artists={topArtists}
                dateRange="Nov 10 –16"
            />
        </div>
    )
}
