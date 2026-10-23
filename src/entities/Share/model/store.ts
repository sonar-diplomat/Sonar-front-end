import { useCallback,useMemo,useState } from 'react';

import { legacyQuery } from '@shared/api/legacyQuery';
import { store } from '@shared/store';
import type { RequestConfig } from '@shared/types';
import type { State } from '@shared/types/store';

import { shareApi } from '../api/rtkApi';

const pickError = (res: { success: boolean; errors?: string[]; details?: string[]; message?: string }) =>
    res?.success ? undefined : res?.errors?.[0] || res?.details?.[0] || res?.message;

export const useGetShareLink = () => {
    const [state, setState] = useState<State<string>>({ loading: false });
    const refetch = useCallback(async (entityType: string, entityId: number, cfg?: RequestConfig) => {
        setState((s) => ({ ...s, loading: true }));
        const res = await legacyQuery(() => store.dispatch(shareApi.endpoints.getShareLink.initiate({entityType,entityId}, {subscribe:false,forceRefetch:true})).unwrap(), cfg);
        setState({ loading: false, data: res.data, error: pickError(res) });
        return res;
    }, []);
    return useMemo(() => ({ ...state, refetch }), [state, refetch]);
};

export const useGetShareQr = () => {
    const [state, setState] = useState<State<string>>({ loading: false });
    const refetch = useCallback(async (entityType: string, entityId: number, cfg?: RequestConfig) => {
        setState((s) => ({ ...s, loading: true }));
        const res = await legacyQuery(() => store.dispatch(shareApi.endpoints.getShareQr.initiate({entityType,entityId}, {subscribe:false,forceRefetch:true})).unwrap(), cfg);
        setState({ loading: false, data: res.data, error: pickError(res) });
        return res;
    }, []);
    return useMemo(() => ({ ...state, refetch }), [state, refetch]);
};

