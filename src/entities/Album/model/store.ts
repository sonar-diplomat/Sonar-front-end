import { useCallback,useMemo,useState } from 'react';

import type { ShareLinkDTO } from '@entities/Collection';
import { legacyQuery } from '@shared/api/legacyQuery';
import { store } from '@shared/store';
import type { RequestConfig } from "@shared/types";
import type { State } from '@shared/types/store';

import { AlbumApi } from '../api/api.ts';
import { albumApi } from '../api/rtkApi';

import type { AlbumDTO, UploadAlbumDTO } from './types';


const pickError = (res: { success: boolean; errors?: string[]; details?: string[]; message?: string }) =>
    res?.success ? undefined : res?.errors?.[0] || res?.details?.[0] || res?.message;

export const useUploadAlbum = () => {
    const [state, setState] = useState<State<AlbumDTO>>({ loading: false });
    const mutate = useCallback(async (body: UploadAlbumDTO, RequestConfig?: RequestConfig) => {
        setState({ loading: true });
        const res = await AlbumApi.upload(body, RequestConfig);
        setState({ loading: false, data: res.data, error: pickError(res) });
        return res;
    }, []);
    return useMemo(() => ({ ...state, mutate }), [state, mutate]);
};

export const useDeleteAlbum = () => {
    const [state, setState] = useState<State<void>>({ loading: false });
    const mutate = useCallback(async (albumId: number, RequestConfig?: RequestConfig) => {
        setState({ loading: true });
        const res = await AlbumApi.delete(albumId, RequestConfig);
        setState({ loading: false, error: pickError(res) });
        return res;
    }, []);
    return useMemo(() => ({ ...state, mutate }), [state, mutate]);
};

export const useUpdateAlbumName = () => {
    const [state, setState] = useState<State<AlbumDTO>>({ loading: false });
    const mutate = useCallback(async (albumId: number, name: string, RequestConfig?: RequestConfig) => {
        setState({ loading: true });
        const res = await AlbumApi.updateName(albumId, name, RequestConfig);
        setState({ loading: false, data: res.data, error: pickError(res) });
        return res;
    }, []);
    return useMemo(() => ({ ...state, mutate }), [state, mutate]);
};

export const useAlbumAddTrack = () => {
    const [state, setState] = useState<State<unknown>>({ loading: false });
    const mutate = useCallback(async (albumId: number, body: unknown, RequestConfig?: RequestConfig) => {
        setState({ loading: true });
        const res = await AlbumApi.addTrack(albumId, body, RequestConfig);
        setState({ loading: false, data: res.data, error: pickError(res) });
        return res;
    }, []);
    return useMemo(() => ({ ...state, mutate }), [state, mutate]);
};

export const useUpdateAlbumCover = () => {
    const [state, setState] = useState<State<void>>({ loading: false });
    const mutate = useCallback(async (albumId: number, file: File, RequestConfig?: RequestConfig) => {
        setState({ loading: true });
        const res = await AlbumApi.updateCover(albumId, file, RequestConfig);
        setState({ loading: false, error: pickError(res) });
        return res;
    }, []);
    return useMemo(() => ({ ...state, mutate }), [state, mutate]);
};

export const useAlbumShareLink = () => {
    const [state, setState] = useState<State<ShareLinkDTO>>({ loading: false });
    const refetch = useCallback(async (albumId: number, RequestConfig?: RequestConfig) => {
        setState({ loading: true });
        const res = await legacyQuery(async () => ({url: await store.dispatch(albumApi.endpoints.getAlbumShareLink.initiate(albumId, {subscribe:false,forceRefetch:true})).unwrap()}), RequestConfig);
        setState({ loading: false, data: res.data, error: pickError(res) });
        return res;
    }, []);
    return useMemo(() => ({ ...state, refetch }), [state, refetch]);
};

export const useAlbumShareQr = () => {
    const [state, setState] = useState<State<Blob>>({ loading: false });
    const refetch = useCallback(async (albumId: number, RequestConfig?: RequestConfig) => {
        setState({ loading: true });
        const res = await AlbumApi.shareQr(albumId, RequestConfig);
        setState({ loading: false, data: res.ok ? await res.blob() : undefined, error: res.ok ? undefined : res.statusText });
        return res;
    }, []);
    return useMemo(() => ({ ...state, refetch }), [state, refetch]);
};

export const useAlbumUpdateVisibility = () => {
    const [state, setState] = useState<State<void>>({ loading: false });
    const mutate = useCallback(async (albumId: number, visibilityStatusId: number, RequestConfig?: RequestConfig) => {
        setState({ loading: true });
        const res = await AlbumApi.updateVisibility(albumId, visibilityStatusId, RequestConfig);
        setState({ loading: false, error: pickError(res) });
        return res;
    }, []);
    return useMemo(() => ({ ...state, mutate }), [state, mutate]);
};
