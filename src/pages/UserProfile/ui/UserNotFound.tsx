import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@shared/ui';
import styles from './UserNotFound.module.css';

export const UserNotFound: React.FC = () => {
    const navigate = useNavigate();

    const handleGoHome = () => {
        navigate('/home');
    };

    return (
        <div className={styles.container}>
            <div className={styles.content}>
                <div className={styles.icon}>
                    <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="60" cy="60" r="60" fill="#1F1F1F" />
                        <path
                            d="M60 30C45.64 30 34 41.64 34 56C34 70.36 45.64 82 60 82C74.36 82 86 70.36 86 56C86 41.64 74.36 30 60 30ZM60 76C48.95 76 40 67.05 40 56C40 44.95 48.95 36 60 36C71.05 36 80 44.95 80 56C80 67.05 71.05 76 60 76Z"
                            fill="#666"
                        />
                        <path
                            d="M60 42C55.58 42 52 45.58 52 50C52 54.42 55.58 58 60 58C64.42 58 68 54.42 68 50C68 45.58 64.42 42 60 42Z"
                            fill="#666"
                        />
                        <path
                            d="M40 90C40 90 45 85 60 85C75 85 80 90 80 90"
                            stroke="#666"
                            strokeWidth="3"
                            strokeLinecap="round"
                        />
                    </svg>
                </div>
                <h1 className={styles.title}>User not found</h1>
                <p className={styles.description}>
                    The user you're looking for doesn't exist or has been removed.
                </p>
                <Button
                    variant="filled"
                    theme="light"
                    size="large"
                    shape="cr-16"
                    onClick={handleGoHome}
                >
                    Go to Home
                </Button>
            </div>
        </div>
    );
};

