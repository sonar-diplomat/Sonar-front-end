import React from 'react';

import { useNavigate } from 'react-router-dom';

import { useGetUserByIdQuery } from '@entities/User/api/rtkApi';
import { getImageUrlById } from '@shared/lib/image-utils';
import { useClientSettings } from '@shared/store/features/clientSettings/useClientSettings';
import { Button,LeftArrow,LoadingImage } from '@shared/ui';

import styles from './BlockedAccounts.module.css';
const BlockedAccount = ({ id, unblock, disabled }: { id: number; unblock: () => void; disabled: boolean }) => {
    const { data: user } = useGetUserByIdQuery(id);
    const avatar = getImageUrlById(user?.avatarImageId);
    return <div className={styles.userCard}><div className={styles.userInfo}>
        {avatar && <div className={styles.avatarWrapper}><LoadingImage src={avatar} alt={user?.publicIdentifier || 'User'} /></div>}
        <span>{user?.publicIdentifier || `User ${id}`}</span></div><Button disabled={disabled} onClick={unblock}>Unblock</Button></div>;
};
export const BlockedAccounts = () => {
    const navigate = useNavigate();
    const { settings, isLoading, error, patchSettings } = useClientSettings();
    const ids = settings?.blockedUserIds || [];
    return <main className={styles.container}>
        <div className={styles.header}><Button icon={<LeftArrow />} theme="dark" aria-label="Back to settings" onClick={() => navigate('/settings')} iconOnly /><h1>Blocked accounts</h1></div>
        <div className={styles.content}>
            {isLoading && <p role="status">Loading…</p>}{error && <p role="alert">Unable to update blocked accounts.</p>}
            {ids.map(id => <BlockedAccount key={id} id={id} disabled={isLoading} unblock={() => void patchSettings({ blockedUserIds: ids.filter(value => value !== id) })} />)}
            {!isLoading && !ids.length && <p>No blocked accounts. Users you block appear here.</p>}
        </div>
    </main>;
};

