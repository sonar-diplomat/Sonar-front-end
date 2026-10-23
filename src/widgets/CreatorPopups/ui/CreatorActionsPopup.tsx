import React from "react";

import { ProfileIcon,ShareIcon,UnfollowIcon,WarningIcon } from "@shared/ui";

import { creatorPopupsTexts } from "../model/texts";

import { CreatorBasePopup } from "./CreatorBasePopup";
import styles from "./CreatorPopup.module.css";


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
