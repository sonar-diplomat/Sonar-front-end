import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CreatePostForm, type PostFormData } from '@widgets/CreatePostForm';
import { useCreatePostMutation, useGetArtistByIdQuery } from '@entities/Artist';
import { useCurrentUserId } from '@shared/lib/auth';
import { getImageUrl } from '@shared/lib/image-utils';
import { useNotifications } from '@shared/lib/notifications';
import styles from './CreatePost.module.css';

export const CreatePost: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const currentUserId = useCurrentUserId();
    const { showSuccess, showError } = useNotifications();

    const [createPost, { isLoading }] = useCreatePostMutation();
    const { data: artistData, isLoading: isLoadingArtist } = useGetArtistByIdQuery(
        Number(id),
        { skip: !id }
    );

    const isOwner = currentUserId && artistData && currentUserId === artistData.userId;

    const handleFormSubmit = async (data: PostFormData) => {
        try {
            await createPost({
                title: data.topic,
                textContent: data.content,
                setPublicOn: data.scheduledDate,
            }).unwrap();

            showSuccess('Post created successfully');
            navigate(`/artist/${id}/posts`);
        } catch (error: unknown) {
            const apiError = error as { data?: { message?: string; errors?: unknown } };
            showError(
                apiError.data?.message || 'Failed to create post',
                apiError.data?.errors
            );
        }
    };

    const handleFormCancel = () => {
        navigate(`/artist/${id}/posts`);
    };

    if (isLoadingArtist) {
        return <div className={styles.container}>Loading...</div>;
    }

    if (!artistData || !isOwner) {
        return null;
    }

    const avatarUrl = getImageUrl(artistData.user?.avatarImageId) || 'https://placehold.co/52x52';

    return (
        <div className={styles.container}>
            <CreatePostForm
                artistName={artistData.artistName}
                artistAvatar={avatarUrl}
                onSubmit={handleFormSubmit}
                onCancel={handleFormCancel}
                isSubmitting={isLoading}
            />
        </div>
    );
};
