import React, { useState } from 'react';

import { Link } from 'react-router-dom';

import { apiClient } from '@shared/api/oldBaseApi';
import { isDemoMode } from '@shared/config/data-source';
import type { NormalizedApiResponse } from '@shared/types';
import { Button, Input } from '@shared/ui';
/** Read-only endpoint diagnostics use exactly the same adapter as application features. */
export const ApiTestPage = () => {
    const [endpoint, setEndpoint] = useState('Track/1');
    const [result, setResult] = useState<NormalizedApiResponse<unknown> | null>(null);
    const [loading, setLoading] = useState(false);
    const run = async (event: React.FormEvent) => {
        event.preventDefault(); setLoading(true);
        try { setResult(await apiClient.get<unknown>(endpoint)); }
        catch (error) { setResult({ success: false, status: 0, message: error instanceof Error ? error.message : 'Request failed' }); }
        finally { setLoading(false); }
    };
    return <main style={{ padding: 24, maxWidth: 900, margin: 'auto', display: 'grid', gap: 20 }}>
        <Link to="/home">Home</Link><h1>API diagnostics</h1>
        <p>Profile: {isDemoMode ? 'local demo transport' : 'server API'}. This page performs GET requests through the shared adapter.</p>
        <form onSubmit={event => void run(event)} style={{ display: 'grid', gap: 12 }}>
            <Input label="Endpoint" value={endpoint} onChange={event => setEndpoint(event.target.value)} required />
            <Button type="submit" disabled={loading}>{loading ? 'Loading…' : 'Run GET'}</Button>
        </form>
        {result && <pre style={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere', overflow: 'auto' }} aria-label="API response">{JSON.stringify(result, null, 2)}</pre>}
    </main>;
};
