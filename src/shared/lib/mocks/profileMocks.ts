import type { Playlist } from '@pages/Library';
import type { Song } from '@widgets/TopSongsWidget';
import type { Artist } from '@widgets/TopArtistsWidget';
import type { ArtistMessage } from '@widgets/ArtistMessageCard';

export const getMockPlaylists = (): Playlist[] => [
    { id: '1', name: 'Playlist 1' },
    { id: '2', name: 'Playlist 2' },
    { id: '3', name: 'Playlist 3' },
    { id: '4', name: 'Playlist 4' }
];

export const getMockTopSongs = (): Song[] => [
    { id: '1', title: 'Whispers of the Dreamscape', artist: 'Moody', imageSrc: 'https://placehold.co/64x64' },
    { id: '2', title: 'Whispers of the Dreamscape', artist: 'Moody', imageSrc: 'https://placehold.co/64x64' },
    { id: '3', title: 'Whispers of the Dreamscape', artist: 'Moody', imageSrc: 'https://placehold.co/64x64' },
    { id: '4', title: 'Whispers of the Dreamscape', artist: 'Moody', imageSrc: 'https://placehold.co/64x64' },
    { id: '5', title: 'Whispers of the Dreamscape', artist: 'Moody', imageSrc: 'https://placehold.co/64x64' },
];

export const getMockTopArtists = (): Artist[] => [
    { id: '1', name: 'Moody', imageSrc: 'https://placehold.co/64x64' },
    { id: '2', name: 'Weekend', imageSrc: 'https://placehold.co/64x64' },
    { id: '3', name: 'Atro boy', imageSrc: 'https://placehold.co/64x64' },
    { id: '4', name: 'DOORFEEVA', imageSrc: 'https://placehold.co/64x64' },
    { id: '5', name: 'Negative', imageSrc: 'https://placehold.co/64x64' },
];

export const getMockArtistMessages = (): ArtistMessage[] => [
    {
        id: '1',
        artistName: 'Moody',
        artistImage: 'https://placehold.co/52x52',
        title: 'New track out now!',
        timestamp: '2h',
        content: "Hey everyone! I'm excited to announce that my new track drops tonight at midnight! Can't wait for you all to hear it. It's been a journey creating this one, and I hope it resonates with you.",
    },
    {
        id: '2',
        artistName: 'Moody',
        artistImage: 'https://placehold.co/52x52',
        title: 'New track out now!',
        timestamp: '2h',
        content: "Hey everyone! I'm excited to announce that my new track drops tonight at midnight! Can't wait for you all to hear it. It's been a journey creating this one, and I hope it resonates with you." +
            "Hey everyone! I'm excited to announce that my new track drops tonight at midnight! Can't wait for you all to hear it. It's been a journey creating this one, and I hope it resonates with you." +
            "Hey everyone! I'm excited to announce that my new track drops tonight at midnight! Can't wait for you all to hear it. It's been a journey creating this one, and I hope it resonates with you." +
            "Hey everyone! I'm excited to announce that my new track drops tonight at midnight! Can't wait for you all to hear it. It's been a journey creating this one, and I hope it resonates with you.s",
        link: {
            url: 'https://instagram.com',
            text: 'Visit my instagram!'
        },
        hasExpandableText: true
    },
    {
        id: '3',
        artistName: 'Moody',
        artistImage: 'https://placehold.co/52x52',
        title: 'New track out now!',
        timestamp: '2h',
        content: "Hey everyone! I'm excited to announce that my new track drops tonight at midnight! Can't wait for you all to hear it. It's been a journey creating this one, and I hope it resonates with you.",
        track: {
            title: 'Sunken City Lights',
            artist: 'Moody',
            coverImage: 'https://placehold.co/378x205'
        },
        link: {
            url: 'https://instagram.com',
            text: 'Visit my instagram!'
        },
        hasExpandableText: true
    },
    {
        id: '4',
        artistName: 'Moody',
        artistImage: 'https://placehold.co/52x52',
        title: 'New track out now!',
        timestamp: '2h',
        content: "Hey everyone! I'm excited to announce that my new track drops tonight at midnight! Can't wait for you all to hear it. It's been a journey creating this one, and I hope it resonates with you.",
        link: {
            url: 'https://instagram.com',
            text: 'Visit my instagram!'
        }
    }
];