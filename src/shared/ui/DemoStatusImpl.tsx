import React, { useEffect, useState } from 'react';
export const DemoStatusImpl = () => {
    const [warning, setWarning] = useState('');
    useEffect(() => {
        let active = true;
        let unsubscribe: (() => void) | undefined;
        void import('@demo-runtime').then(runtime => {
            const update = () => { const status = runtime.getDemoStatus(); if (active) setWarning([!status.persistent ? status.reason || 'Changes cannot be saved after reload.' : '', status.binaryWarning || ''].filter(Boolean).join(' ')); };
            update(); unsubscribe = runtime.subscribeDemoEvents(update);
        });
        return () => { active = false; unsubscribe?.(); };
    }, []);
    return warning ? <p role="alert">{warning}</p> : null;
};
