import { useCallback, useMemo, useState } from 'react';
import { Api } from '../api/api.ts';
import type { PlaylistDTO, CursorPageDTO } from './types';
import type { TrackDTO } from '@entities/Music';
import type { State } from '@shared/types/store';
import type {RequestConfig} from "@shared/types";
import type {ShareLinkDTO} from "@entities/Collection";

const pickError = (res: any) =>
    res?.success ? undefined : res?.errors?.[0] || res?.details?.[0] || res?.message;

export const useCreatePlaylist = () => {
    const [state, setState] = useState<State<PlaylistDTO>>({ loading: false });
    const mutate = useCallback(async (body: any, cfg?: RequestConfig) => {
        setState({ loading: true });
        const res = await Api.create(body, cfg);
        setState({ loading: false, data: res.data, error: pickError(res) });
        return res;
    }, []);
    return useMemo(() => ({ ...state, mutate }), [state, mutate]);
};

export const useDeletePlaylist = () => {
    const [state, setState] = useState<State<void>>({ loading: false });
    const mutate = useCallback(async (playlistId: number, cfg?: RequestConfig) => {
        setState({ loading: true });
        const res = await Api.delete(playlistId, cfg);
        setState({ loading: false, error: pickError(res) });
        return res;
    }, []);
    return useMemo(() => ({ ...state, mutate }), [state, mutate]);
};

export const useUpdatePlaylistName = () => {
    const [state, setState] = useState<State<PlaylistDTO>>({ loading: false });
    const mutate = useCallback(async (playlistId: number, newName: string, cfg?: RequestConfig) => {
        setState({ loading: true });
        const res = await Api.updateName(playlistId, newName, cfg);
        setState({ loading: false, data: res.data, error: pickError(res) });
        return res;
    }, []);
    return useMemo(() => ({ ...state, mutate }), [state, mutate]);
};

export const useUpdatePlaylistCover = () => {
    const [state, setState] = useState<State<void>>({ loading: false });
    const mutate = useCallback(async (playlistId: number, coverFile: File, cfg?: RequestConfig) => {
        setState({ loading: true });
        const res = await Api.updateCover(playlistId, coverFile, cfg);
        setState({ loading: false, error: pickError(res) });
        return res;
    }, []);
    return useMemo(() => ({ ...state, mutate }), [state, mutate]);
};

export const useAddContributor = () => {
    const [state, setState] = useState<State<void>>({ loading: false });
    const mutate = useCallback(async (playlistId: number, contributorId: number, cfg?: RequestConfig) => {
        setState({ loading: true });
        const res = await Api.addContributor(playlistId, contributorId, cfg);
        setState({ loading: false, error: pickError(res) });
        return res;
    }, []);
    return useMemo(() => ({ ...state, mutate }), [state, mutate]);
};

export const useRemoveContributor = () => {
    const [state, setState] = useState<State<void>>({ loading: false });
    const mutate = useCallback(async (playlistId: number, contributorId: number, cfg?: RequestConfig) => {
        setState({ loading: true });
        const res = await Api.removeContributor(playlistId, contributorId, cfg);
        setState({ loading: false, error: pickError(res) });
        return res;
    }, []);
    return useMemo(() => ({ ...state, mutate }), [state, mutate]);
};

export const useAddTrackToPlaylist = () => {
    const [state, setState] = useState<State<void>>({ loading: false });
    const mutate = useCallback(async (playlistId: number, trackId: number, cfg?: RequestConfig) => {
        setState({ loading: true });
        const res = await Api.addTrack(playlistId, trackId, cfg);
        setState({ loading: false, error: pickError(res) });
        return res;
    }, []);
    return useMemo(() => ({ ...state, mutate }), [state, mutate]);
};

export const useRemoveTrackFromPlaylist = () => {
    const [state, setState] = useState<State<void>>({ loading: false });
    const mutate = useCallback(async (playlistId: number, trackId: number, cfg?: RequestConfig) => {
        setState({ loading: true });
        const res = await Api.removeTrack(playlistId, trackId, cfg);
        setState({ loading: false, error: pickError(res) });
        return res;
    }, []);
    return useMemo(() => ({ ...state, mutate }), [state, mutate]);
};

export const usePlaylistTracks = () => {
    const [state, setState] = useState<State<CursorPageDTO<TrackDTO>>>({ loading: false });
    const refetch = useCallback(
        async (playlistId: number, args?: { after?: string | null; limit?: number }, cfg?: RequestConfig) => {
            setState((s) => ({ ...s, loading: true }));
            const res = await Api.tracks(playlistId, args, cfg);
            setState({ loading: false, data: res.data, error: pickError(res) });
            return res;
        },
        []
    );
    return useMemo(() => ({ ...state, refetch }), [state, refetch]);
};

export const usePlaylistById = () => {
    const [state, setState] = useState<State<PlaylistDTO>>({ loading: false });
    const refetch = useCallback(async (playlistId: number, cfg?: RequestConfig) => {
        setState((s) => ({ ...s, loading: true }));
        const res = await Api.byId(playlistId, cfg);
        setState({ loading: false, data: res.data, error: pickError(res) });
        return res;
    }, []);
    return useMemo(() => ({ ...state, refetch }), [state, refetch]);
};

export const useImportCollectionToPlaylist = () => {
    const [state, setState] = useState<State<void>>({ loading: false });
    const mutate = useCallback(
        async (playlistId: number, collection: string, collectionId: number, cfg?: RequestConfig) => {
            setState({ loading: true });
            const res = await Api.importCollection(playlistId, collection, collectionId, cfg);
            setState({ loading: false, error: pickError(res) });
            return res;
        },
        []
    );
    return useMemo(() => ({ ...state, mutate }), [state, mutate]);
};

export const usePlaylistShareLink = () => {
    const [state, setState] = useState<State<ShareLinkDTO>>({ loading: false });
    const refetch = useCallback(async (playlistId: number, cfg?: RequestConfig) => {
        setState({ loading: true });
        const res = await Api.shareLink(playlistId, cfg);
        setState({ loading: false, data: res.data, error: pickError(res) });
        return res;
    }, []);
    return useMemo(() => ({ ...state, refetch }), [state, refetch]);
};

export const usePlaylistShareQr = () => {
    const [state, setState] = useState<State<Blob>>({ loading: false });
    const refetch = useCallback(async (playlistId: number, cfg?: RequestConfig) => {
        setState({ loading: true });
        const res = await Api.shareQr(playlistId, cfg);
        setState({ loading: false, data: (res as any).data as Blob, error: pickError(res) });
        return res;
    }, []);
    return useMemo(() => ({ ...state, refetch }), [state, refetch]);
};

export const usePlaylistUpdateVisibility = () => {
    const [state, setState] = useState<State<void>>({ loading: false });
    const mutate = useCallback(async (playlistId: number, visibilityStatusId: number, cfg?: RequestConfig) => {
        setState({ loading: true });
        const res = await Api.updateVisibility(playlistId, visibilityStatusId, cfg);
        setState({ loading: false, error: pickError(res) });
        return res;
    }, []);
    return useMemo(() => ({ ...state, mutate }), [state, mutate]);
};
