import React from "react";
import styles from "./CarouselDots.module.css";

interface CarouselDotsProps {
    total: number;
    currentIndex: number;
}

export const CarouselDots: React.FC<CarouselDotsProps> = ({ total, currentIndex }) => {
    return (
        <div className={styles.dotsContainer}>
            {Array.from({ length: total }).map((_, index) => (
                <div
                    key={index}
                    className={`${styles.dot} ${index === currentIndex ? styles.active : ""}`}
                />
            ))}
        </div>
    );
};