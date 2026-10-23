import React,{ useState } from 'react';

import { Outlet,useLocation,useNavigate,useParams } from 'react-router-dom';

import { useDeletePostMutation,useGetArtistByIdQuery,useGetArtistPostsQuery } from '@entities/Artist';
import { useCurrentUserId } from '@shared/lib/auth';
import { getImageUrlById } from '@shared/lib/image-utils';
import { useNotifications } from '@shared/store/notificationStore';
import { Button,Modal } from '@shared/ui';
import { ArtistPostCard } from '@widgets/ArtistMessageCard';
import { ProfileHeader } from '@widgets/ProfileHeader';

import styles from './ArtistProfile.module.css';
export const ArtistPosts: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { id } = useParams();
    const currentUserId = useCurrentUserId();
    const creating = location.pathname.endsWith('/create');
    const { data: artist } = useGetArtistByIdQuery(Number(id), { skip: !id });
    const { data: posts, isLoading, error, refetch } = useGetArtistPostsQuery(Number(id), { skip: !id || creating });
    const [deletePost, { isLoading: deleting }] = useDeletePostMutation();
    const [selected, setSelected] = useState<number | null>(null);
    const { showError } = useNotifications();
    const owner = currentUserId === artist?.userId;
    if (creating) return <Outlet />;
    return <>
        <ProfileHeader viewerType={owner ? 'owner' : 'guest'} profileType="artist" secondaryTab="Posts" onTabChange={tab => navigate(tab.toLowerCase() === 'posts' ? `/artist/${id}/posts` : `/artist/${id}`)} onBackClick={() => navigate(`/artist/${id}`)} />
        <main className={styles.messagesView}>
            {owner && <Button theme="dark" onClick={() => navigate(`/artist/${id}/posts/create`)}>Create new post</Button>}
            {isLoading && <p role="status">Loading posts…</p>}
            {error && <><p role="alert">Unable to load posts.</p><Button onClick={() => void refetch()}>Retry</Button></>}
            {posts?.length === 0 && <p>No posts yet.</p>}
            {posts?.map(post => <ArtistPostCard key={post.id} message={{ id: String(post.id), artistName: artist?.artistName || 'Artist', artistImage: getImageUrlById(artist?.user?.avatarImageId || 0) || '', title: post.title, timestamp: new Date(post.createdAt).toLocaleDateString(), content: post.textContent }} onMenuClick={owner ? value => setSelected(Number(value)) : undefined} />)}
        </main>
        <Modal isOpen={selected !== null} onClose={() => setSelected(null)} title="Delete post?">
            <p>This removes the selected post.</p><Button theme="dark" disabled={deleting} onClick={() => { if (selected) void deletePost(selected).unwrap().then(() => { setSelected(null); void refetch(); }).catch(() => showError('Unable to delete post')); }}>Delete post</Button><Button onClick={() => setSelected(null)}>Cancel</Button>
        </Modal>
    </>;
};
