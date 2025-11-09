import React from "react";
import { useNavigate } from "react-router-dom";
import {Button, RightArrow, QRCode} from "@shared/ui";
import styles from "./EntryMethod.module.css";

export const EntryMethod: React.FC = () => {
    const navigate = useNavigate();

    const handleSignIn = () => {
        console.log("Sign in quickly");
    };

    const handleCreateAccount = () => {
        navigate('/register');
    };

    const handleQRScan = () => {
        console.log("QR scan");
    };

    const handleGuest = () => {
        navigate('/');
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>Get started</h1>
                <p className={styles.subtitle}>Please select the method that is convenient for you to continue.</p>
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
                    Sign in quickly
                </Button>

                <Button
                    onClick={handleCreateAccount}
                    variant="dark"
                    size="large"
                    shape="cr-16"
                    fullWidth
                >
                    Create account in one touch
                </Button>

                <Button
                    onClick={handleQRScan}
                    variant="dark"
                    size="large"
                    shape="cr-16"
                    fullWidth
                    icon={<QRCode />}
                >
                    Or scan Qr-code
                </Button>

                <button className={styles.guestLink} onClick={handleGuest}>
                    Try as a guest
                </button>
            </div>
        </div>
    );
}
