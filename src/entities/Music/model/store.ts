import { useCallback,useMemo,useState } from 'react';

import { legacyQuery } from '@shared/api/legacyQuery';
import { withAuth } from '@shared/lib/auth/withAuth';
import { store } from '@shared/store';
import type { RequestConfig } from "@shared/types";
import type { State } from '@shared/types/store';

import { Api } from '../api/api.ts';
import { musicApi } from '../api/rtkApi';

import type { TrackDTO,UpdateTrackDTO,UpdateTrackFileDTO } from './types';

const pickError = (res: { success: boolean; errors?: string[]; details?: string[]; message?: string }) =>
    res?.success ? undefined : res?.errors?.[0] || res?.details?.[0] || res?.message;

export const useTrack = () => {
    const [state, setState] = useState<State<TrackDTO>>({ loading: false });
    const refetch = useCallback(async (trackId: number, cfg?: RequestConfig) => {
        setState((s) => ({ ...s, loading: true }));
        const res = await withAuth(() => legacyQuery(() => store.dispatch(musicApi.endpoints.getTrack.initiate(trackId, {subscribe:false,forceRefetch:true})).unwrap(), cfg));
        setState({ loading: false, data: res.data, error: pickError(res) });
        return res;
    }, []);
    return useMemo(() => ({ ...state, refetch }), [state, refetch]);
};

/**
 * @deprecated Use useUpdateTrackMutation from @shared/api/rtkApi instead
 */
export const useUpdateTrack = () => {
    const [state, setState] = useState<State<TrackDTO>>({ loading: false });
    const mutate = useCallback(async (trackId: number, body: UpdateTrackDTO, cfg?: RequestConfig) => {
        setState({ loading: true });
        const res = await withAuth(() => Api.updateInfo(trackId, body, cfg));
        setState({ loading: false, data: res.data, error: pickError(res) });
        return res;
    }, []);
    return useMemo(() => ({ ...state, mutate }), [state, mutate]);
};

/**
 * @deprecated Use useUpdateTrackFileMutation from @shared/api/rtkApi instead
 */
export const useUpdateTrackFile = () => {
    const [state, setState] = useState<State<void>>({ loading: false });
    const mutate = useCallback(async (trackId: number, body: UpdateTrackFileDTO, cfg?: RequestConfig) => {
        setState({ loading: true });
        const res = await withAuth(() => Api.updateFile(trackId, body, cfg));
        setState({ loading: false, error: pickError(res) });
        return res;
    }, []);
    return useMemo(() => ({ ...state, mutate }), [state, mutate]);
};

/**
 * @deprecated Use useDeleteTrackMutation from @shared/api/rtkApi instead
 */
export const useDeleteTrack = () => {
    const [state, setState] = useState<State<void>>({ loading: false });
    const mutate = useCallback(async (trackId: number, cfg?: RequestConfig) => {
        setState({ loading: true });
        const res = await withAuth(() => Api.delete(trackId, cfg));
        setState({ loading: false, error: pickError(res) });
        return res;
    }, []);
    return useMemo(() => ({ ...state, mutate }), [state, mutate]);
};

/**
 * @deprecated Use useUpdateTrackVisibilityMutation from @shared/api/rtkApi instead
 */
export const useUpdateTrackVisibility = () => {
    const [state, setState] = useState<State<void>>({ loading: false });
    const mutate = useCallback(async (trackId: number, visibilityStatusId: number, cfg?: RequestConfig) => {
        setState({ loading: true });
        const res = await withAuth(() => Api.updateVisibility(trackId, visibilityStatusId, cfg));
        setState({ loading: false, error: pickError(res) });
        return res;
    }, []);
    return useMemo(() => ({ ...state, mutate }), [state, mutate]);
};

/**
 * @deprecated Use useToggleTrackFavoriteMutation from @shared/api/rtkApi instead
 */
export const useToggleTrackFavorite = () => {
    const [state, setState] = useState<State<void>>({ loading: false });
    const mutate = useCallback(async (trackId: number, cfg?: RequestConfig) => {
        setState({ loading: true });
        const res = await withAuth(() => Api.toggleFavorite(trackId, cfg));
        setState({ loading: false, error: pickError(res) });
        return res;
    }, []);
    return useMemo(() => ({ ...state, mutate }), [state, mutate]);
};