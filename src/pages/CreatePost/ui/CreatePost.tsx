import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CreatePostForm, type PostFormData } from '@widgets/CreatePostForm';
import { useCreatePostMutation, useGetArtistByIdQuery, type PostDTO } from '@entities/Artist';
import styles from './CreatePost.module.css';

export const CreatePost: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();

    const [createPost, { isLoading }] = useCreatePostMutation();

    // Fetch artist data to get artist name
    const { data: artistData } = useGetArtistByIdQuery(Number(id), {
        skip: !id,
    });

    const handleFormSubmit = async (data: PostFormData) => {
        try {
            const postDTO: PostDTO = {
                title: data.topic,
                textContent: data.content,
                setPublicOn: data.scheduledDate,
            };

            await createPost(postDTO).unwrap();
            navigate(`/artist/${id}/posts`);
        } catch (error) {
            console.error('Failed to create post:', error);
            // You could add error handling UI here
        }
    };

    const handleFormCancel = () => {
        navigate(`/artist/${id}/posts`);
    };

    return (
        <div className={styles.container}>
            <CreatePostForm
                artistName={artistData?.artistName || 'Artist'}
                artistAvatar="https://placehold.co/52x52"
                onSubmit={handleFormSubmit}
                onCancel={handleFormCancel}
                isSubmitting={isLoading}
            />
        </div>
    );
};
