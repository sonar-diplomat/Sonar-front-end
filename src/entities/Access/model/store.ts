import { useCallback, useMemo, useState } from 'react';
import { Api } from '../api/api.ts';
import type { AccessFeatureDTO } from './types';
import type { State } from '@shared/types/store';

export const useAccessFeatures = () => {
    const [state, setState] = useState<State<AccessFeatureDTO[]>>({ loading: false });
    const refetch = useCallback(async () => {
        setState((s) => ({ ...s, loading: true }));
        const res = await Api.list();
        setState({
            loading: false,
            data: res.data,
            error: res.success ? undefined : res.errors?.[0] || res.details?.[0] || res.message,
        });
        return res;
    }, []);
    return useMemo(() => ({ ...state, refetch }), [state, refetch]);
};

export const useAccessFeatureById = () => {
    const [state, setState] = useState<State<AccessFeatureDTO>>({ loading: false });
    const refetch = useCallback(async (id: number) => {
        setState((s) => ({ ...s, loading: true }));
        const res = await Api.byId(id);
        setState({
            loading: false,
            data: res.data,
            error: res.success ? undefined : res.errors?.[0] || res.details?.[0] || res.message,
        });
        return res;
    }, []);
    return useMemo(() => ({ ...state, refetch }), [state, refetch]);
};

export const useUserAccessFeatures = () => {
    const [state, setState] = useState<State<AccessFeatureDTO[]>>({ loading: false });
    const refetch = useCallback(async (userId: number) => {
        setState((s) => ({ ...s, loading: true }));
        const res = await Api.byUserId(userId);
        setState({
            loading: false,
            data: res.data,
            error: res.success ? undefined : res.errors?.[0] || res.details?.[0] || res.message,
        });
        return res;
    }, []);
    return useMemo(() => ({ ...state, refetch }), [state, refetch]);
};

export const useAssignAccessFeatures = () => {
    const [state, setState] = useState<State<void>>({ loading: false });
    const mutate = useCallback(async (userId: number, accessFeatureIds: number[]) => {
        setState({ loading: true });
        const res = await Api.assign(userId, accessFeatureIds);
        setState({ loading: false, error: res.success ? undefined : res.errors?.[0] || res.details?.[0] || res.message });
        return res;
    }, []);
    return useMemo(() => ({ ...state, mutate }), [state, mutate]);
};

export const useRevokeAccessFeatures = () => {
    const [state, setState] = useState<State<void>>({ loading: false });
    const mutate = useCallback(async (userId: number, accessFeatureIds: number[]) => {
        setState({ loading: true });
        const res = await Api.revoke(userId, accessFeatureIds);
        setState({ loading: false, error: res.success ? undefined : res.errors?.[0] || res.details?.[0] || res.message });
        return res;
    }, []);
    return useMemo(() => ({ ...state, mutate }), [state, mutate]);
};
