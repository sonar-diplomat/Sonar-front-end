import React from "react";
import { trackTexts } from "../model/texts";
import styles from "./GetPremiumCard.module.css";
import {PremiumShapeIcon, RightArrow} from "@shared/ui";

type Props = {
    onClick?: () => void;
};

export const GetPremiumCard: React.FC<Props> = ({ onClick }) => {
    return (
        <section className={styles.card} onClick={onClick}>
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
