import React from "react";
import { creatorPopupsTexts } from "../model/texts";
import styles from "./CreatorPopup.module.css";
import { CreatorBasePopup } from "./CreatorBasePopup";

type Props = {
    onClose?: () => void;
};

export const CreatorLinksPopup: React.FC<Props> = ({ onClose }) => {
    const { userName, linksPopup } = creatorPopupsTexts;

    return (
        <CreatorBasePopup
            title={userName}
            subtitle={linksPopup.subtitle}
            onClose={onClose}
        >
            {linksPopup.items.map((item) => (
                <div key={item.title} className={styles.listItem}>
                    <div className={styles.itemIcon}>🔗</div>
                    <div className={styles.itemText}>
                        <span className={styles.itemTitle}>{item.title}</span>
                        <span className={styles.itemSubtitle}>{item.subtitle}</span>
                    </div>
                </div>
            ))}
        </CreatorBasePopup>
    );
};