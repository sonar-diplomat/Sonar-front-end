import { useCallback, useMemo, useState } from 'react';
import { Api } from '../api/api';
import type { FolderDTO, CreateFolderDTO } from './types';
import type { State } from '@shared/types/store';
import type { RequestConfig } from '@shared/types';
import { withAuth } from '@shared/lib/auth/withAuth';

const pickError = (res: any) =>
    res?.success ? undefined : res?.errors?.[0] || res?.details?.[0] || res?.message;

export const useGetFolder = () => {
    const [state, setState] = useState<State<FolderDTO>>({ loading: false });
    const refetch = useCallback(async (folderId: number, cfg?: RequestConfig) => {
        setState((s) => ({ ...s, loading: true }));
        const res = await Api.byId(folderId, cfg);
        setState({ loading: false, data: res.data, error: pickError(res) });
        return res;
    }, []);
    return useMemo(() => ({ ...state, refetch }), [state, refetch]);
};

export const useGetAllFolders = () => {
    const [state, setState] = useState<State<FolderDTO[]>>({ loading: false });
    const refetch = useCallback(async (cfg?: RequestConfig) => {
        setState((s) => ({ ...s, loading: true }));
        const res = await Api.list(cfg);
        setState({ loading: false, data: res.data, error: pickError(res) });
        return res;
    }, []);
    return useMemo(() => ({ ...state, refetch }), [state, refetch]);
};

export const useCreateFolder = () => {
    const [state, setState] = useState<State<FolderDTO>>({ loading: false });
    const mutate = useCallback(async (dto: CreateFolderDTO, cfg?: RequestConfig) => {
        setState({ loading: true });
        const res = await withAuth(() => Api.create(dto, cfg));
        setState({ loading: false, data: res.data, error: pickError(res) });
        return res;
    }, []);
    return useMemo(() => ({ ...state, mutate }), [state, mutate]);
};

export const useUpdateFolderName = () => {
    const [state, setState] = useState<State<FolderDTO>>({ loading: false });
    const mutate = useCallback(async (folderId: number, newName: string, cfg?: RequestConfig) => {
        setState({ loading: true });
        const res = await withAuth(() => Api.updateName(folderId, newName, cfg));
        setState({ loading: false, data: res.data, error: pickError(res) });
        return res;
    }, []);
    return useMemo(() => ({ ...state, mutate }), [state, mutate]);
};

export const useDeleteFolder = () => {
    const [state, setState] = useState<State<void>>({ loading: false });
    const mutate = useCallback(async (folderId: number, cfg?: RequestConfig) => {
        setState({ loading: true });
        const res = await withAuth(() => Api.delete(folderId, cfg));
        setState({ loading: false, error: pickError(res) });
        return res;
    }, []);
    return useMemo(() => ({ ...state, mutate }), [state, mutate]);
};

export const useAddCollectionToFolder = () => {
    const [state, setState] = useState<State<void>>({ loading: false });
    const mutate = useCallback(async (folderId: number, collectionId: number, cfg?: RequestConfig) => {
        setState({ loading: true });
        const res = await withAuth(() => Api.addCollection(folderId, collectionId, cfg));
        setState({ loading: false, error: pickError(res) });
        return res;
    }, []);
    return useMemo(() => ({ ...state, mutate }), [state, mutate]);
};

export const useRemoveCollectionFromFolder = () => {
    const [state, setState] = useState<State<void>>({ loading: false });
    const mutate = useCallback(async (folderId: number, collectionId: number, cfg?: RequestConfig) => {
        setState({ loading: true });
        const res = await withAuth(() => Api.removeCollection(folderId, collectionId, cfg));
        setState({ loading: false, error: pickError(res) });
        return res;
    }, []);
    return useMemo(() => ({ ...state, mutate }), [state, mutate]);
};

export const useMoveFolder = () => {
    const [state, setState] = useState<State<void>>({ loading: false });
    const mutate = useCallback(async (folderId: number, newParentFolderId: number, cfg?: RequestConfig) => {
        setState({ loading: true });
        const res = await withAuth(() => Api.move(folderId, newParentFolderId, cfg));
        setState({ loading: false, error: pickError(res) });
        return res;
    }, []);
    return useMemo(() => ({ ...state, mutate }), [state, mutate]);
};

