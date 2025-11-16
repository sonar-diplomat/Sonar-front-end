import React, {useState} from 'react';
import styles from './Library.module.css';
import {Button, FolderCard, Input, ItemCard, ItemCardContainer, PlusIcon, SearchIcon} from "@shared/ui";
import {ChipsBar} from "@widgets/ChipsBar";

export const Library = () => {
    const [folders, setFolders] = useState(["Every day", "Gym", "Party", "Work"]);

    return (
        <div className={styles.container}>
            <div className={styles.title}>
                Library
            </div>
            <div className={styles.searchWrapper}>
                <Input type={"text"} placeholder={"Search in library"} icon={<SearchIcon/>} iconPosition={"suffix"} />
            </div>
            <ChipsBar/>
            <Button className={styles.createBtn} icon={<PlusIcon/>}>
                Create New
            </Button>
            <div className={styles.sectionsContainer}>
                <ItemCardContainer title={"Folders"} count={folders.length} countLabel={"folders"}>
                    {folders.map((folderName) => (
                        <FolderCard key={folderName} label={folderName}/>
                    ))}
                </ItemCardContainer>
                <ItemCardContainer title={"Playlists"} count={4} countLabel={"playlists"}>
                    <ItemCard/>
                    <ItemCard/>
                    <ItemCard/>
                    <ItemCard/>
                </ItemCardContainer>
            </div>
        </div>
    );
};
