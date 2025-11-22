import React from 'react'
import {Button, ProfileCard, LeftArrow, ShareIcon} from "@shared/ui";
import styles from './UserProfile.module.css'

export const UserProfile = () => {
    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <Button variant={"dark"} size={"medium"} shape={"cr-16"} icon={<LeftArrow/>} />
                <p>Profile</p>
                <p>Library</p>
            </div>
            <ProfileCard isVerified stats={{followers:13, following:12, publicPlaylists: 10}} src={"https://fastly.picsum.photos/id/192/200/200.jpg?hmac=ADFozPC7IeAOBiVxD2ZbHYkpCVEa8Xj_tZE_Dm7yFuo"} alt={"profileImage"}/>
            <div>
                <Button icon={<ShareIcon/>} children={"Follow"}/>
                <div>3 dots</div>
            </div>
            <div>Container Playlist</div>
            <div>Image</div>
        </div>
    )
}
