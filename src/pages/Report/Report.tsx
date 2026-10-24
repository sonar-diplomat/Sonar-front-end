import React,{ useState } from 'react';

import { Link,useSearchParams } from 'react-router-dom';

import { useCreateReportMutation,useGetReportEntityTypesQuery,useGetReportReasonTypesByEntityTypeQuery } from '@entities/Report/api/rtkApi';
import { isDemoMode } from '@shared/config/data-source';
import { Button } from '@shared/ui';
export const Report = () => {
    const [params] = useSearchParams();
    const { data: types } = useGetReportEntityTypesQuery();
    const [create, { data: report, isLoading, error }] = useCreateReportMutation();
    const [reason, setReason] = useState('');
    const [entityType, setEntityType] = useState('');
    const [identifier, setIdentifier] = useState(params.get('messageId') || params.get('userId') || params.get('entityId') || '');
    const suggestedType = params.has('messageId') || params.has('userId')
        ? types?.find(type => type.name.toLowerCase().includes(params.has('messageId') ? 'message' : 'user'))?.id
        : undefined;
    const unsupportedMessage = params.has('messageId') && types && !suggestedType;
    const activeType = Number(entityType || suggestedType);
    const { currentData: reasons } = useGetReportReasonTypesByEntityTypeQuery(activeType, { skip: !activeType });
    return <main style={{ padding: 24, maxWidth: 640, margin: 'auto', display: 'grid', gap: 20 }}>
        <Link to="/home">Home</Link><h1>Report content</h1>
        {isDemoMode && <p>Demo report: stored in this browser; no moderation team receives it.</p>}
        {unsupportedMessage ? <p role="status">Message reports are unavailable in the current content-type catalog. Tracks, playlists, users and posts can be reported from their own context.</p> : report ? <p role="status">Report #{report.id} saved.</p> : <form onSubmit={event => { event.preventDefault(); void create({ entityIdentifier: Number(identifier), reportableEntityTypeId: Number(entityType || suggestedType), reportReasonTypeId: Number(reason) }); }} style={{ display: 'grid', gap: 16 }}>
            <label>Content ID <input type="number" min="1" required value={identifier} onChange={event => setIdentifier(event.target.value)} /></label>
            <label>Content type <select aria-label="Content type" required value={entityType || suggestedType || ''} onChange={event => { setEntityType(event.target.value); setReason(''); }}><option value="">Choose type</option>{types?.map(type => <option key={type.id} value={type.id}>{type.name}</option>)}</select></label>
            <label>Reason <select aria-label="Reason" required value={reason} onChange={event => setReason(event.target.value)}><option value="">Choose reason</option>{reasons?.map(type => <option key={type.id} value={type.id}>{type.name}</option>)}</select></label>
            {error && <p role="alert">Unable to save the report. Choose a valid content ID, type and reason.</p>}
            <Button type="submit" disabled={isLoading}>Save report</Button>
        </form>}
    </main>;
};
