import { useCallback, useMemo, useState } from 'react';
import { Api } from '../api/api';
import type { Settings } from './types/Settings';
import type { State } from '@shared/types/store';
import type { RequestConfig } from '@shared/types';
import { withAuth } from '@shared/lib/auth/withAuth';

const pickError = (res: any) =>
    res?.success ? undefined : res?.errors?.[0] || res?.details?.[0] || res?.message;

export const useGetClientSettings = () => {
    const [state, setState] = useState<State<Settings>>({ loading: false });
    const refetch = useCallback(async (cfg?: RequestConfig) => {
        setState((s) => ({ ...s, loading: true }));
        const res = await withAuth(() => Api.get(cfg));
        setState({ loading: false, data: res.data, error: pickError(res) });
        return res;
    }, []);
    return useMemo(() => ({ ...state, refetch }), [state, refetch]);
};

export const usePatchClientSettings = () => {
    const [state, setState] = useState<State<Settings>>({ loading: false });
    const mutate = useCallback(async (updates: Record<string, unknown>, cfg?: RequestConfig) => {
        setState({ loading: true });
        const res = await withAuth(() => Api.patch(updates, cfg));
        setState({ loading: false, data: res.data, error: pickError(res) });
        return res;
    }, []);
    return useMemo(() => ({ ...state, mutate }), [state, mutate]);
};

