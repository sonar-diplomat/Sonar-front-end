import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {Button, RightArrow} from "@shared/ui";
import { CarouselDots } from "@widgets/CarouselDots";
import styles from "./Hello.module.css";

export const Hello: React.FC = () => {
    const navigate = useNavigate();

    const textPage = [
        {
            "title": "Be part of us!",
            "primary": "Your opportunity to become a member of a large community",
            "secondary": "Music isn't just something we hear; it's a vibrant part of our lives that connects us with new friends.",
            "buttonText": "Next"
        },
        {
            "title": "Get together to listen to music together!",
            "primary": "Our goal is to bring music lovers together.",
            "secondary": "Start listening now and discuss your favorite tracks with friends right in this app.",
            "buttonText": "Next"
        },
        {
            "title": "Express yourself!",
            "primary": "We want to see your creativity",
            "secondary": "Buy unique stickers and customize your own player to show your achievements to your friends!",
            "buttonText": "Get Started!"
        }
    ];

    const [currentPage, setCurrentPage] = useState(0);

    const handleNext = () => {
        if (currentPage === textPage.length - 1) {
            navigate('/entry');
        } else {
            setCurrentPage((prevPage) => prevPage + 1);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.title}>
                <h1 className={styles.titleText}>{textPage[currentPage].title}</h1>
            </div>
            <div className={styles.main}>
                <p className={styles.mainPrimaryText}>{textPage[currentPage].primary}</p>
                <p className={styles.mainSecondaryText}>{textPage[currentPage].secondary}</p>
            </div>
            <div className={styles.step}>
                <CarouselDots total={textPage.length} currentIndex={currentPage} />
            </div>
            <div className={styles.button}>
                <Button onClick={handleNext} children={textPage[currentPage].buttonText} icon={<RightArrow/>} shape={"cr-16"} size={"large"} fullWidth />
            </div>
        </div>
    );
}
