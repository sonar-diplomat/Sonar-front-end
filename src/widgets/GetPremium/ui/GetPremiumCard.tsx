import React from "react";

import { PremiumShapeIcon,RightArrow } from "@shared/ui";

import { trackTexts } from "../model/texts";

import styles from "./GetPremiumCard.module.css";

type Props = {
    onClick?: () => void;
};

export const GetPremiumCard: React.FC<Props> = ({ onClick }) => {
    return (
        <section className={styles.card} role="button" tabIndex={0} aria-label="Get Sonar premium" onClick={onClick} onKeyDown={event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); onClick?.(); } }}>
            <div className={styles.content}>
                <h2 className={styles.title}>{trackTexts.title}</h2>
                <p className={styles.description}>{trackTexts.description}</p>
            </div>

            <div className={styles.shape}>
                <PremiumShapeIcon />

                <div className={styles.arrow}>
                    <RightArrow color="#000000" />
                </div>
            </div>
        </section>
    );
};
