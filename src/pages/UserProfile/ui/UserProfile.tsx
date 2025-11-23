import React from 'react'
import {Button, MoreIcon, ProfileCard, UpRightArrow} from "@shared/ui";
import styles from './UserProfile.module.css'
import {ProfileHeader} from "@widgets/ProfileHeader";


export const UserProfile = () => {
    return (
        <div className={styles.container}>
            <ProfileHeader/>
            <ProfileCard isVerified name={"Vannesa"} stats={{followers:125, following:16, publicPlaylists: 10}} src={"https://placehold.co/378x264"} alt={"profileImage"}/>
            <div className={styles.profileActions}>
                <Button size={"medium"} shape={"cr-16"} icon={<UpRightArrow/>} children={"Follow"} fullWidth/>
                <div className={styles.svgBox}>
                    <MoreIcon />
                </div>

            </div>
            <div>Container Playlist</div>
            <div>Image</div>
        </div>
    )
}
