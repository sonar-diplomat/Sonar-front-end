import { useCallback, useMemo, useState } from 'react';
import { Api } from '../api/api';
import type { State } from '@shared/types/store';
import type { RequestConfig } from '@shared/types';

const pickError = (res: any) =>
    res?.success ? undefined : res?.errors?.[0] || res?.details?.[0] || res?.message;

export const useGetShareLink = () => {
    const [state, setState] = useState<State<string>>({ loading: false });
    const refetch = useCallback(async (entityType: string, entityId: number, cfg?: RequestConfig) => {
        setState((s) => ({ ...s, loading: true }));
        const res = await Api.link(entityType, entityId, cfg);
        setState({ loading: false, data: res.data, error: pickError(res) });
        return res;
    }, []);
    return useMemo(() => ({ ...state, refetch }), [state, refetch]);
};

export const useGetShareQr = () => {
    const [state, setState] = useState<State<string>>({ loading: false });
    const refetch = useCallback(async (entityType: string, entityId: number, cfg?: RequestConfig) => {
        setState((s) => ({ ...s, loading: true }));
        const res = await Api.qr(entityType, entityId, cfg);
        setState({ loading: false, data: res.data, error: pickError(res) });
        return res;
    }, []);
    return useMemo(() => ({ ...state, refetch }), [state, refetch]);
};

