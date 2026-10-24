import React from 'react';

import { Link,useParams } from 'react-router-dom';

import { useGetTrackQuery } from '@entities/Music/api/rtkApi';
import { getImageUrlById } from '@shared/lib/image-utils';
import { usePlayer } from '@shared/store/features/player';
import { ActionMenu,Button,LoadingImage } from '@shared/ui';
import { getArtistNames } from '@widgets/MiniPlayer/lib/utils';
export const Track = () => {
    const { id } = useParams();
    const trackId = Number(id);
    const { data: track, isLoading, error } = useGetTrackQuery(trackId, { skip: !Number.isInteger(trackId) || trackId <= 0 });
    const { playTrack } = usePlayer();
    const [menuOpen, setMenuOpen] = React.useState(false);
    if (isLoading) return <main style={{ padding: 24 }} role="status">Loading track…</main>;
    if (error || !track) return <main style={{ padding: 24 }}><h1>Track not found</h1><Link to="/search">Search songs</Link></main>;
    return <main style={{ padding: 24, maxWidth: 720, margin: 'auto', display: 'grid', gap: 20 }}>
        <Link to="/home">Home</Link>
        <div style={{ width: 'min(100%, 320px)', aspectRatio: '1', overflow: 'hidden', borderRadius: 24 }}><LoadingImage src={getImageUrlById(track.coverId) || ''} alt={track.title} /></div>
        <h1>{track.title}</h1><p>{getArtistNames(track)}</p>
        <Button onClick={() => playTrack(track)}>Play song</Button>
        <Button theme="dark" onClick={() => setMenuOpen(true)}>Song actions</Button>
        {'demoCredits' in track && track.demoCredits && <p>Music: {track.demoCredits.title} by <a href={track.demoCredits.sourceUrl} target="_blank" rel="noreferrer">{track.demoCredits.artist}</a> · <a href={track.demoCredits.licenseUrl} target="_blank" rel="noreferrer">{track.demoCredits.license}</a>. Catalog profiles are fictional demo data.</p>}
        {menuOpen && <ActionMenu isOpen onClose={() => setMenuOpen(false)} context={{ type: 'track', entityId: track.id, entityName: track.title }} />}
    </main>;
};
