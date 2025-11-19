import React, {type ReactNode } from "react";
import styles from "./CreatorPopup.module.css";

type BasePopupProps = {
    title: string;
    subtitle: string;
    onClose?: () => void;
    children: ReactNode;
};

export const CreatorBasePopup: React.FC<BasePopupProps> = ({
   title,
   subtitle,
   onClose,
   children,
}) => {
    return (
        <div className={styles.backdrop}>
            <section className={styles.sheet}>
                <header className={styles.header}>
                    <div className={styles.avatar} />
                    <div className={styles.headerText}>
                        <span className={styles.userName}>{title}</span>
                        <span className={styles.subtitle}>{subtitle}</span>
                    </div>
                    <button className={styles.closeButton} onClick={onClose}>
                        ✕
                    </button>
                </header>

                <div className={styles.list}>{children}</div>
            </section>
        </div>
    );
};