import React,{ useMemo } from 'react';

import { useNavigate,useParams } from 'react-router-dom';

import { useGetArtistByIdQuery } from '@entities/Artist';
import { useFollowUserMutation,useGetFollowersQuery,useUnfollowUserMutation } from '@entities/User/api/rtkApi';
import { useSearchQuery } from '@shared/api';
import { useCurrentUserId } from '@shared/lib/auth';
import { getImageUrl,getImageUrlById } from '@shared/lib/image-utils';
import { MarkdownRenderer } from '@shared/lib/markdown/MarkdownRenderer';
import { useNotifications } from '@shared/store/notificationStore';
import type { ViewerType } from '@shared/types';
import { Button,ItemCard,ProfileCard } from '@shared/ui';
import { ProfileActionButtons } from '@widgets/ProfileActionButtons';
import { ProfileLayout } from '@widgets/ProfileLayout';

import styles from './ArtistProfile.module.css';
export const ArtistProfile: React.FC<{ viewerType?: ViewerType }> = ({ viewerType: initialViewerType }) => {
    const { id } = useParams();
    const navigate = useNavigate();
    const currentUserId = useCurrentUserId();
    const { data: artist, isLoading, error, refetch } = useGetArtistByIdQuery(Number(id), { skip: !id });
    const { data: catalog } = useSearchQuery({ query: artist?.artistName || '', limit: 100 }, { skip: !artist });
    const { data: followers } = useGetFollowersQuery(artist?.userId || 0, { skip: !artist });
    const [follow, { isLoading: following }] = useFollowUserMutation();
    const [unfollow, { isLoading: unfollowing }] = useUnfollowUserMutation();
    const { showError } = useNotifications();
    const viewerType = useMemo(() => initialViewerType || (currentUserId === artist?.userId ? 'owner' : 'guest'), [initialViewerType, currentUserId, artist]);
    if (isLoading) return <p style={{ padding: 24 }} role="status">Loading artist profile…</p>;
    if (error || !artist) return <main style={{ padding: 24 }}><h1>Artist not found</h1><Button onClick={() => void refetch()}>Retry</Button><Button onClick={() => navigate('/search')}>Search</Button></main>;
    const isFollowing = followers?.items.some(user => user.id === currentUserId) || false;
    const changeFollow = async () => { try { await (isFollowing ? unfollow(artist.userId) : follow(artist.userId)).unwrap(); } catch { showError('Unable to change following'); } };
    return <ProfileLayout viewerType={viewerType} profileType="artist" secondaryTab="Posts"
        onBackClick={() => navigate('/home')} onMessageClick={() => navigate('/chats')} onTabChange={tab => navigate(tab.toLowerCase() === 'posts' ? `/artist/${id}/posts` : `/artist/${id}`)}
        profileCard={<ProfileCard name={artist.artistName} src={getImageUrl(artist.user?.avatarImageId) || ''} alt={`${artist.artistName} profile`} />}
        actionButtons={<ProfileActionButtons viewerType={viewerType} profileType="artist" isFollowing={isFollowing} isLoading={following || unfollowing} onFollow={() => void changeFollow()} onUnfollow={() => void changeFollow()} />}
        profileView={<div className={styles.widgetsContainer}>
            <section><h2>Albums</h2><div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>{catalog?.albums?.items.map(album => <ItemCard key={album.id} image={getImageUrlById(album.coverId)} textContent={{ title: album.name }} to={`/album/${album.id}`} />)}</div>{catalog?.albums?.items.length === 0 && <p>No albums yet.</p>}</section>
            <section><h2>Songs</h2><div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>{catalog?.tracks?.items.map(track => <ItemCard key={track.id} image={getImageUrlById(track.coverId)} textContent={{ title: track.title }} to={`/track/${track.id}`} />)}</div>{catalog?.tracks?.items.length === 0 && <p>No songs yet.</p>}</section>
            {artist.user?.biography && <section><h2>About the artist</h2><MarkdownRenderer content={artist.user.biography} /></section>}
        </div>} />;
};
