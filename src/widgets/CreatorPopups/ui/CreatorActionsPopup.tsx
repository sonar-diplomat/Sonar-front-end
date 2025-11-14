import React from "react";
import { creatorPopupsTexts } from "../model/texts";
import styles from "./CreatorPopup.module.css";
import { CreatorBasePopup } from "./CreatorBasePopup";
import {ProfileIcon, ShareIcon, UnfollowIcon, WarningIcon} from "@shared/ui";


type Props = {
    onClose?: () => void;
};

export const CreatorActionsPopup: React.FC<Props> = ({ onClose }) => {
    const { userName, actionsPopup } = creatorPopupsTexts;

    const icons = [
        <ShareIcon/>,
        <ProfileIcon/>,
        <UnfollowIcon/>,
        <WarningIcon/>
    ];

    return (
        <CreatorBasePopup
            title={userName}
            subtitle={actionsPopup.subtitle}
            onClose={onClose}
        >
            {actionsPopup.items.map((item, index) => (
                <div key={item.title} className={styles.listItem}>
                    <div className={styles.itemIcon}>{icons[index]}</div>
                    <div className={styles.itemText}>
                        <span className={styles.itemTitle}>{item.title}</span>
                    </div>
                </div>
            ))}
        </CreatorBasePopup>
    );
};
