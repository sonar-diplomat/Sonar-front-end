import React from "react";
import { useNavigate } from "react-router-dom";
import { Button, RightArrow } from "@shared/ui";
import styles from "./EntryMethod.module.css";

export const EntryMethod: React.FC = () => {
    const navigate = useNavigate();

    const handleSignIn = () => {
        navigate('/login');
    };

    const handleCreateAccount = () => {
        navigate('/register');
    };

    const handleGuest = () => {
        navigate('/');
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>Get started</h1>
                <p className={styles.subtitle}>Please choose whether you want to sign-in or create a new account</p>
            </div>

            <div className={styles.buttonGroup}>
                <Button
                    onClick={handleSignIn}
                    variant="light"
                    size="large"
                    shape="cr-16"
                    fullWidth
                    icon={<RightArrow />}
                >
                    Sign in
                </Button>

                <Button
                    onClick={handleCreateAccount}
                    variant="dark"
                    size="large"
                    shape="cr-16"
                    fullWidth
                >
                    Create an account
                </Button>

                <button className={styles.guestLink} onClick={handleGuest}>
                    Try as a guest
                </button>
            </div>
        </div>
    );
}
