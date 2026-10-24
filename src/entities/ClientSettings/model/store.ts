import { useCallback,useMemo,useState } from 'react';

import { legacyQuery } from '@shared/api/legacyQuery';
import { withAuth } from '@shared/lib/auth/withAuth';
import { store } from '@shared/store';
import type { RequestConfig } from '@shared/types';
import type { State } from '@shared/types/store';

import { Api } from '../api/api';
import { clientSettingsApi } from '../api/rtkApi';

import type { Settings } from './types/Settings';

const pickError = (res: { success: boolean; errors?: string[]; details?: string[]; message?: string }) =>
    res?.success ? undefined : res?.errors?.[0] || res?.details?.[0] || res?.message;

export const useGetClientSettings = () => {
    const [state, setState] = useState<State<Settings>>({ loading: false });
    const refetch = useCallback(async (cfg?: RequestConfig) => {
        setState((s) => ({ ...s, loading: true }));
        const res = await withAuth(() => legacyQuery(() => store.dispatch(clientSettingsApi.endpoints.getClientSettings.initiate(undefined, {subscribe:false,forceRefetch:true})).unwrap(), cfg));
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

