import { useCallback, useMemo, useState } from 'react';
import { Api } from '../api/api';
import type { State } from '@shared/types/store';
import type { RequestConfig } from '@shared/types';
import { withAuth } from '@shared/lib/auth/withAuth';

const pickError = (res: any) =>
    res?.success ? undefined : res?.errors?.[0] || res?.details?.[0] || res?.message;

export const useUpdateCurrentPosition = () => {
    const [state, setState] = useState<State<void>>({ loading: false });
    const mutate = useCallback(async (position: string, cfg?: RequestConfig) => {
        setState({ loading: true });
        const res = await withAuth(() => Api.updateCurrentPosition(position, cfg));
        setState({ loading: false, error: pickError(res) });
        return res;
    }, []);
    return useMemo(() => ({ ...state, mutate }), [state, mutate]);
};

export const useUpdateListeningTarget = () => {
    const [state, setState] = useState<State<void>>({ loading: false });
    const mutate = useCallback(async (trackId: number, collectionId?: number, cfg?: RequestConfig) => {
        setState({ loading: true });
        const res = await withAuth(() => Api.updateListeningTarget(trackId, collectionId, cfg));
        setState({ loading: false, error: pickError(res) });
        return res;
    }, []);
    return useMemo(() => ({ ...state, mutate }), [state, mutate]);
};

export const useAddToQueue = () => {
    const [state, setState] = useState<State<void>>({ loading: false });
    const mutate = useCallback(async (cfg?: RequestConfig) => {
        setState({ loading: true });
        const res = await withAuth(() => Api.addToQueue(cfg));
        setState({ loading: false, error: pickError(res) });
        return res;
    }, []);
    return useMemo(() => ({ ...state, mutate }), [state, mutate]);
};

export const useDeleteFromQueue = () => {
    const [state, setState] = useState<State<void>>({ loading: false });
    const mutate = useCallback(async (cfg?: RequestConfig) => {
        setState({ loading: true });
        const res = await withAuth(() => Api.deleteFromQueue(cfg));
        setState({ loading: false, error: pickError(res) });
        return res;
    }, []);
    return useMemo(() => ({ ...state, mutate }), [state, mutate]);
};

export const useUpdateUserStatus = () => {
    const [state, setState] = useState<State<void>>({ loading: false });
    const mutate = useCallback(async (statusId: number, cfg?: RequestConfig) => {
        setState({ loading: true });
        const res = await withAuth(() => Api.updateStatus(statusId, cfg));
        setState({ loading: false, error: pickError(res) });
        return res;
    }, []);
    return useMemo(() => ({ ...state, mutate }), [state, mutate]);
};

export const useUpdateUserPrimarySession = () => {
    const [state, setState] = useState<State<void>>({ loading: false });
    const mutate = useCallback(async (cfg?: RequestConfig) => {
        setState({ loading: true });
        const res = await withAuth(() => Api.updatePrimarySession(cfg));
        setState({ loading: false, error: pickError(res) });
        return res;
    }, []);
    return useMemo(() => ({ ...state, mutate }), [state, mutate]);
};

