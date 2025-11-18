import { useCallback, useMemo, useState } from 'react';
import { Api } from '../api/api';
import type { PostDTO } from './types';
import type { State } from '@shared/types/store';
import type { RequestConfig } from '@shared/types';
import { withAuth } from '@shared/lib/auth/withAuth';

const pickError = (res: any) =>
    res?.success ? undefined : res?.errors?.[0] || res?.details?.[0] || res?.message;

export const useRegisterArtist = () => {
    const [state, setState] = useState<State<void>>({ loading: false });
    const mutate = useCallback(async (cfg?: RequestConfig) => {
        setState({ loading: true });
        const res = await Api.register(cfg);
        setState({ loading: false, error: pickError(res) });
        return res;
    }, []);
    return useMemo(() => ({ ...state, mutate }), [state, mutate]);
};

export const useUpdateArtistName = () => {
    const [state, setState] = useState<State<void>>({ loading: false });
    const mutate = useCallback(async (artistId: number, newArtistName: string, cfg?: RequestConfig) => {
        setState({ loading: true });
        const res = await withAuth(() => Api.updateName(artistId, newArtistName, cfg));
        setState({ loading: false, error: pickError(res) });
        return res;
    }, []);
    return useMemo(() => ({ ...state, mutate }), [state, mutate]);
};

export const useDeleteArtist = () => {
    const [state, setState] = useState<State<void>>({ loading: false });
    const mutate = useCallback(async (cfg?: RequestConfig) => {
        setState({ loading: true });
        const res = await withAuth(() => Api.delete(cfg));
        setState({ loading: false, error: pickError(res) });
        return res;
    }, []);
    return useMemo(() => ({ ...state, mutate }), [state, mutate]);
};

export const useCreatePost = () => {
    const [state, setState] = useState<State<void>>({ loading: false });
    const mutate = useCallback(async (dto: PostDTO, cfg?: RequestConfig) => {
        setState({ loading: true });
        const res = await withAuth(() => Api.createPost(dto, cfg));
        setState({ loading: false, error: pickError(res) });
        return res;
    }, []);
    return useMemo(() => ({ ...state, mutate }), [state, mutate]);
};

export const useDeletePost = () => {
    const [state, setState] = useState<State<void>>({ loading: false });
    const mutate = useCallback(async (postId: number, cfg?: RequestConfig) => {
        setState({ loading: true });
        const res = await withAuth(() => Api.deletePost(postId, cfg));
        setState({ loading: false, error: pickError(res) });
        return res;
    }, []);
    return useMemo(() => ({ ...state, mutate }), [state, mutate]);
};

export const useUpdatePost = () => {
    const [state, setState] = useState<State<void>>({ loading: false });
    const mutate = useCallback(async (postId: number, dto: PostDTO, cfg?: RequestConfig) => {
        setState({ loading: true });
        const res = await withAuth(() => Api.updatePost(postId, dto, cfg));
        setState({ loading: false, error: pickError(res) });
        return res;
    }, []);
    return useMemo(() => ({ ...state, mutate }), [state, mutate]);
};

export const useUpdatePostVisibility = () => {
    const [state, setState] = useState<State<void>>({ loading: false });
    const mutate = useCallback(async (postId: number, visibilityStatusId: number, cfg?: RequestConfig) => {
        setState({ loading: true });
        const res = await withAuth(() => Api.updatePostVisibility(postId, visibilityStatusId, cfg));
        setState({ loading: false, error: pickError(res) });
        return res;
    }, []);
    return useMemo(() => ({ ...state, mutate }), [state, mutate]);
};

