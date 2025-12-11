import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CreatePostForm, type PostFormData } from '@widgets/CreatePostForm';
import styles from './CreatePost.module.css';

export const CreatePost: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();

    const handleFormSubmit = (data: PostFormData) => {
        console.log('Post submitted:', data);
        // TODO: Implement API call to create post
        navigate(`/artist/${id}/posts`);
    };

    const handleFormCancel = () => {
        navigate(`/artist/${id}/posts`);
    };

    return (
        <div className={styles.container}>
            <CreatePostForm
                artistName="Moody"
                artistAvatar="https://placehold.co/52x52"
                onSubmit={handleFormSubmit}
                onCancel={handleFormCancel}
            />
        </div>
    );
};
