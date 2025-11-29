import React, {useMemo, useState} from 'react'
import {ItemCard, ProfileCard} from "@shared/ui";
import styles from './UserProfile.module.css'
import {ProfileHeader} from "@widgets/ProfileHeader";
import {type ContentSection, ContentSections} from "@widgets/ContentSections";
import {TopSongsWidget, type Song} from "@widgets/TopSongsWidget";
import {TopArtistsWidget, type Artist} from "@widgets/TopArtistsWidget";
import type {Playlist} from "@pages/Library";
import {ProfileActionButtons} from "./ProfileActionButtons";

export type UserRole = 'user' | 'artist';
export type ViewerType = 'owner' | 'guest';

interface UserProfileProps {
    role?: UserRole;
    viewerType?: ViewerType;
}

export const UserProfile: React.FC<UserProfileProps> = ({
    role = 'artist',
    viewerType = 'owner'
}) => {

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
    const sections = useMemo<ContentSection<Playlist>[]>(() => [
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
    ], [playlists]);

    return (
        <div className={styles.container}>
            <ProfileHeader secondaryTab={role === 'user' ? 'Library' : 'Posts'}/>
            {role === 'artist' ? (
                <ProfileCard
                    isVerified
                    name={"Moody"}
                    monthlyListeners={18200000}
                    src={"https://placehold.co/378x264"}
                    alt={"profileImage"}
                />
            ) : (
                <ProfileCard
                    isVerified
                    name={"Vanessa"}
                    stats={{followers: 124, following: 16, publicPlaylists: 11}}
                    src={"https://placehold.co/378x264"}
                    alt={"profileImage"}
                />
            )}
            <ProfileActionButtons role={role} viewerType={viewerType} />
            <ContentSections sections={sections}/>
            <ProfileCard
                variant={"bio"}
                isVerified
                title={"Top 1% listener"}
                bio={"Curating playlists with 127 collections and counting 🎧 From morning coffee to late-night vibes, I have a soundtrack for every moment. Share your recommendations below 💌"}
                src={"https://placehold.co/378x264"}
                alt={"profileImage"}
            />
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
