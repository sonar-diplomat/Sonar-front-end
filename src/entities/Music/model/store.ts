import { useCallback, useMemo, useState } from 'react';
import { Api } from '../api/api.ts';
import type { TrackDTO, UpdateTrackDTO, UpdateTrackFileDTO } from './types';
import type { State } from '@shared/types/store';
import type {RequestConfig} from "@shared/types";

const pickError = (res: any) =>
    res?.success ? undefined : res?.errors?.[0] || res?.details?.[0] || res?.message;

export const useTrack = () => {
    const [state, setState] = useState<State<TrackDTO>>({ loading: false });
    const refetch = useCallback(async (trackId: number, cfg?: RequestConfig) => {
        setState((s) => ({ ...s, loading: true }));
        const res = await Api.getById(trackId, cfg);
        setState({ loading: false, data: res.data, error: pickError(res) });
        return res;
    }, []);
    return useMemo(() => ({ ...state, refetch }), [state, refetch]);
};

export const useUpdateTrack = () => {
    const [state, setState] = useState<State<TrackDTO>>({ loading: false });
    const mutate = useCallback(async (trackId: number, body: UpdateTrackDTO, cfg?: RequestConfig) => {
        setState({ loading: true });
        const res = await Api.updateInfo(trackId, body, cfg);
        setState({ loading: false, data: res.data, error: pickError(res) });
        return res;
    }, []);
    return useMemo(() => ({ ...state, mutate }), [state, mutate]);
};

export const useUpdateTrackFile = () => {
    const [state, setState] = useState<State<void>>({ loading: false });
    const mutate = useCallback(async (trackId: number, body: UpdateTrackFileDTO, cfg?: RequestConfig) => {
        setState({ loading: true });
        const res = await Api.updateFile(trackId, body, cfg);
        setState({ loading: false, error: pickError(res) });
        return res;
    }, []);
    return useMemo(() => ({ ...state, mutate }), [state, mutate]);
};

export const useDeleteTrack = () => {
    const [state, setState] = useState<State<void>>({ loading: false });
    const mutate = useCallback(async (trackId: number, cfg?: RequestConfig) => {
        setState({ loading: true });
        const res = await Api.delete(trackId, cfg);
        setState({ loading: false, error: pickError(res) });
        return res;
    }, []);
    return useMemo(() => ({ ...state, mutate }), [state, mutate]);
};
