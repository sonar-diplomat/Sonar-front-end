import React, { useEffect, useState } from 'react';

import { Link } from 'react-router-dom';

import { isDemoMode } from '@shared/config/data-source';
import { useCurrentUserId } from '@shared/lib/auth';
interface OutboxItem { kind: 'confirm-email' | 'reset-password' | 'change-password' | 'change-email'; email: string; token: string; usedAt?: string }
export const DemoOutboxNoticeImpl = ({ kind, email, revision = 0 }: { kind: OutboxItem['kind']; email: string; revision?: number }) => {
    const [item, setItem] = useState<OutboxItem | null>(null);
    const userId = useCurrentUserId();
    useEffect(() => {
        if (!isDemoMode || !email) return;
        let active = true;
        void import('@demo-runtime').then(runtime => {
            const found = [...runtime.getDemoOutbox()].reverse().find(entry => entry.kind === kind && entry.email.toLowerCase() === email.toLowerCase() && !entry.usedAt);
            if (active) setItem(found || null);
        });
        return () => { active = false; };
    }, [kind, email, revision]);
    if (!isDemoMode || !item) return null;
    const params = new URLSearchParams({ email: item.email, token: item.token });
    if (kind === 'change-email') params.set('userId', String(userId || ''));
    const path = kind === 'change-email' ? 'confirm-email-change' : kind;
    return <aside role="status" style={{ padding: 16, border: '1px solid #666', borderRadius: 16, overflowWrap: 'anywhere' }}>
        <p>Demo inbox · no email was sent.</p>
        {kind === 'change-password' ? <p>Local verification token: <strong>{item.token}</strong></p> : <Link to={`/${path}?${params}`}>Open local {kind === 'reset-password' ? 'password reset' : 'email confirmation'} link</Link>}
    </aside>;
};
