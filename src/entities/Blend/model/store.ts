import { useCallback, useMemo, useState } from 'react';
import { Api } from '../api/api';
import type { State } from '@shared/types/store';
import type { RequestConfig } from '@shared/types';
import { withAuth } from '@shared/lib/auth/withAuth';

const pickError = (res: any) =>
    res?.success ? undefined : res?.errors?.[0] || res?.details?.[0] || res?.message;

export const useUpdateBlendVisibility = () => {
    const [state, setState] = useState<State<void>>({ loading: false });
    const mutate = useCallback(async (collectionId: number, visibilityStatusId: number, cfg?: RequestConfig) => {
        setState({ loading: true });
        const res = await withAuth(() => Api.updateVisibility(collectionId, visibilityStatusId, cfg));
        setState({ loading: false, error: pickError(res) });
        return res;
    }, []);
    return useMemo(() => ({ ...state, mutate }), [state, mutate]);
};

export const useToggleBlendFavorite = () => {
    const [state, setState] = useState<State<void>>({ loading: false });
    const mutate = useCallback(async (collectionId: number, cfg?: RequestConfig) => {
        setState({ loading: true });
        const res = await withAuth(() => Api.toggleFavorite(collectionId, cfg));
        setState({ loading: false, error: pickError(res) });
        return res;
    }, []);
    return useMemo(() => ({ ...state, mutate }), [state, mutate]);
};

