import React from "react";
import { useNavigate } from "react-router-dom";
import { Button, RightArrow, HomeIcon } from "@shared/ui";
import styles from "./NotFound.module.css";

export const NotFound: React.FC = () => {
    const navigate = useNavigate();

    // TODO: Change to Home Page
    const handleGoHome = () => {
        navigate('/entry');
    };

    const handleGoBack = () => {
        navigate(-1);
    };

    return (
        <div className={styles.container}>
            <div className={styles.content}>
                <div className={styles.errorCode}>404</div>
                <h1 className={styles.title}>Page not found</h1>
                <p className={styles.subtitle}>
                    The page you are looking for doesn't exist or has been moved.
                </p>
            </div>

            <div className={styles.buttonGroup}>
                <Button
                    onClick={handleGoHome}
                    variant="filled"
                    theme="light"
                    size="large"
                    shape="cr-16"
                    fullWidth
                    icon={<HomeIcon />}
                >
                    Go to Entry
                </Button>

                <Button
                    onClick={handleGoBack}
                    variant="filled"
                    theme="light"
                    size="large"
                    shape="cr-16"
                    fullWidth
                    icon={<RightArrow />}
                >
                    Go back
                </Button>
            </div>
        </div>
    );
};

