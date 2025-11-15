import React, { useState } from 'react';
import styles from './ChipsBar.module.css';
import {Button} from "@shared/ui";

const categories = ['All', 'Creators', 'Playlists', 'Radio'];

const ChipsBar = () => {
    const [selectedCategory, setSelectedCategory] = useState('All');

    return (
        <div className={styles.container}>
            {categories.map((category) => (
                <Button
                    key={category}
                    size="small"
                    shape="cr-16"
                    variant={selectedCategory === category ? 'light' : 'dark'}
                    selected={selectedCategory === category}
                    onClick={() => setSelectedCategory(category)}
                >
                    {category}
                </Button>
            ))}
        </div>
    );
};

export default ChipsBar;