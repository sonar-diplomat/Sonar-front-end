import React from 'react';

import { useLocation, useNavigate } from 'react-router-dom';

import type { ViewerType } from '@shared/types';
import { Button, LeftArrow, MessageIcon, SettingsIcon, TabSlider } from '@shared/ui';

import styles from './ProfileHeader.module.css';
export type ProfileType = 'user' | 'artist';
interface ProfileHeaderProps {
    viewerType: ViewerType; profileType: ProfileType; secondaryTab?: string;
    onBackClick?: () => void; onTabChange?: (tab: string) => void;
    onMessageClick?: () => void; onSettingsClick?: () => void;
}
export const ProfileHeader = ({ viewerType, profileType, secondaryTab = 'Posts', onBackClick, onTabChange, onMessageClick, onSettingsClick }: ProfileHeaderProps) => {
    const navigate = useNavigate();
    const location = useLocation();
    const secondary = secondaryTab.toLowerCase();
    const activeTab = location.pathname.includes(`/${secondary}`) ? secondary : 'music';
    return <header className={`${styles.header} ${viewerType === 'guest' ? styles.headerLeft : styles.headerRight}`}>
        <div className={styles.buttonsContainer}>
            {viewerType === 'guest' ? <Button theme="dark" icon={<LeftArrow />} iconOnly aria-label="Back" onClick={onBackClick || (() => navigate('/home'))} />
                : <Button theme="dark" icon={<MessageIcon />} iconOnly aria-label="Open chats" onClick={onMessageClick || (() => navigate('/chats'))} />}
            {profileType === 'artist' && onTabChange && <div className={styles.tabSliderWrapper}><TabSlider tabs={[{ value: 'music', label: 'Music' }, { value: secondary, label: secondaryTab }]} activeTab={activeTab} onChange={onTabChange} /></div>}
            {viewerType === 'owner' && <Button theme="dark" icon={<SettingsIcon />} iconOnly aria-label="Open settings" onClick={onSettingsClick || (() => navigate('/settings'))} />}
        </div>
    </header>;
};
