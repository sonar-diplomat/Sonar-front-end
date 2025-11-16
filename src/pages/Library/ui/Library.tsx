import React from 'react';
import styles from './Library.module.css';
import {FolderCard, Input, ItemCard, ItemCardContainer, SearchIcon} from "@shared/ui";
import {ChipsBar} from "@widgets/ChipsBar";

export const Library = () => {
    return (
        <div className={styles.container}>
            <div className={styles.title}>
                Library
            </div>
            <Input type={"text"} placeholder={"Search in library"} icon={<SearchIcon/>} iconPosition={"suffix"} />
            <ChipsBar/>
            <button>
                + Create New
            </button>
            <ItemCardContainer title={"Folders"} count={4} countLabel={"folders"}>
                <FolderCard label={"Gym"}/>
                <FolderCard label={"Gym"}/>
                <FolderCard label={"Gym"}/>
                <FolderCard label={"Gym"}/>
            </ItemCardContainer>
            <ItemCardContainer title={"Playlists"} count={4} countLabel={"playlists"}>
                <ItemCard/>
                <ItemCard/>
                <ItemCard/>
                <ItemCard/>
            </ItemCardContainer>
        </div>
    );
};
