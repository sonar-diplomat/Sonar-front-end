import React,{ useState } from 'react';

import { Link,useSearchParams } from 'react-router-dom';

import { useCreateReportMutation,useGetReportEntityTypesQuery,useGetReportReasonTypesQuery } from '@entities/Report/api/rtkApi';
import { isDemoMode } from '@shared/config/data-source';
import { Button } from '@shared/ui';
export const Report = () => {
    const [params] = useSearchParams();
    const { data: types } = useGetReportEntityTypesQuery();
    const { data: reasons } = useGetReportReasonTypesQuery();
    const [create, { data: report, isLoading, error }] = useCreateReportMutation();
    const [reason, setReason] = useState('');
    const [entityType, setEntityType] = useState('');
    const [identifier, setIdentifier] = useState(params.get('messageId') || params.get('userId') || params.get('entityId') || '');
    const suggestedType = types?.find(type => type.name.toLowerCase().includes(params.has('messageId') ? 'message' : 'user'))?.id;
    return <main style={{ padding: 24, maxWidth: 640, margin: 'auto', display: 'grid', gap: 20 }}>
        <Link to="/home">Home</Link><h1>Report content</h1>
        {isDemoMode && <p>Demo report: stored in this browser; no moderation team receives it.</p>}
        {report ? <p role="status">Report #{report.id} saved.</p> : <form onSubmit={event => { event.preventDefault(); void create({ entityIdentifier: Number(identifier), reportableEntityTypeId: Number(entityType || suggestedType), reportReasonTypeId: Number(reason) }); }} style={{ display: 'grid', gap: 16 }}>
            <label>Content ID <input type="number" min="1" required value={identifier} onChange={event => setIdentifier(event.target.value)} /></label>
            <label>Content type <select required value={entityType || suggestedType || ''} onChange={event => setEntityType(event.target.value)}><option value="">Choose type</option>{types?.map(type => <option key={type.id} value={type.id}>{type.name}</option>)}</select></label>
            <label>Reason <select required value={reason} onChange={event => setReason(event.target.value)}><option value="">Choose reason</option>{reasons?.map(type => <option key={type.id} value={type.id}>{type.name}</option>)}</select></label>
            {error && <p role="alert">Unable to save the report. Check the content ID.</p>}
            <Button type="submit" disabled={isLoading}>Save report</Button>
        </form>}
    </main>;
};
