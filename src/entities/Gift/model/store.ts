import { useCallback,useMemo,useState } from 'react';

import type { SubscriptionPaymentDTO } from '@entities/Subscription';
import { legacyQuery } from '@shared/api/legacyQuery';
import { withAuth } from '@shared/lib/auth/withAuth';
import { store } from '@shared/store';
import type { RequestConfig } from '@shared/types';
import type { State } from '@shared/types/store';

import { Api } from '../api/api';
import { giftApi } from '../api/rtkApi';

import type { GiftResponseDTO,GiftStyleDTO,SendGiftDTO } from './types';

const pickError = (res: { success: boolean; errors?: string[]; details?: string[]; message?: string }) =>
    res?.success ? undefined : res?.errors?.[0] || res?.details?.[0] || res?.message;

export const useSendGift = () => {
    const [state, setState] = useState<State<GiftResponseDTO>>({ loading: false });
    const mutate = useCallback(async (dto: SendGiftDTO, cfg?: RequestConfig) => {
        setState({ loading: true });
        const res = await withAuth(() => Api.send(dto, cfg));
        setState({ loading: false, data: res.data, error: pickError(res) });
        return res;
    }, []);
    return useMemo(() => ({ ...state, mutate }), [state, mutate]);
};

export const useAcceptGift = () => {
    const [state, setState] = useState<State<SubscriptionPaymentDTO>>({ loading: false });
    const mutate = useCallback(async (id: number, cfg?: RequestConfig) => {
        setState({ loading: true });
        const res = await withAuth(() => Api.accept(id, cfg));
        setState({ loading: false, data: res.data, error: pickError(res) });
        return res;
    }, []);
    return useMemo(() => ({ ...state, mutate }), [state, mutate]);
};

export const useGetReceivedGifts = () => {
    const [state, setState] = useState<State<GiftResponseDTO[]>>({ loading: false });
    const refetch = useCallback(async (cfg?: RequestConfig) => {
        setState((s) => ({ ...s, loading: true }));
        const res = await withAuth(() => legacyQuery(() => store.dispatch(giftApi.endpoints.getReceivedGifts.initiate(undefined, {subscribe:false,forceRefetch:true})).unwrap(), cfg));
        setState({ loading: false, data: res.data, error: pickError(res) });
        return res;
    }, []);
    return useMemo(() => ({ ...state, refetch }), [state, refetch]);
};

export const useGetSentGifts = () => {
    const [state, setState] = useState<State<GiftResponseDTO[]>>({ loading: false });
    const refetch = useCallback(async (senderId?: number, cfg?: RequestConfig) => {
        setState((s) => ({ ...s, loading: true }));
        const res = await withAuth(() => legacyQuery(() => store.dispatch(giftApi.endpoints.getSentGifts.initiate({senderId}, {subscribe:false,forceRefetch:true})).unwrap(), cfg));
        setState({ loading: false, data: res.data, error: pickError(res) });
        return res;
    }, []);
    return useMemo(() => ({ ...state, refetch }), [state, refetch]);
};

export const useGetGift = () => {
    const [state, setState] = useState<State<GiftResponseDTO>>({ loading: false });
    const refetch = useCallback(async (id: number, cfg?: RequestConfig) => {
        setState((s) => ({ ...s, loading: true }));
        const res = await withAuth(() => legacyQuery(() => store.dispatch(giftApi.endpoints.getGift.initiate(id, {subscribe:false,forceRefetch:true})).unwrap(), cfg));
        setState({ loading: false, data: res.data, error: pickError(res) });
        return res;
    }, []);
    return useMemo(() => ({ ...state, refetch }), [state, refetch]);
};

export const useCancelGift = () => {
    const [state, setState] = useState<State<void>>({ loading: false });
    const mutate = useCallback(async (id: number, cfg?: RequestConfig) => {
        setState({ loading: true });
        const res = await withAuth(() => Api.cancel(id, cfg));
        setState({ loading: false, error: pickError(res) });
        return res;
    }, []);
    return useMemo(() => ({ ...state, mutate }), [state, mutate]);
};

export const useGetGiftStyles = () => {
    const [state, setState] = useState<State<GiftStyleDTO[]>>({ loading: false });
    const refetch = useCallback(async (cfg?: RequestConfig) => {
        setState((s) => ({ ...s, loading: true }));
        const res = await legacyQuery(() => store.dispatch(giftApi.endpoints.getGiftStyles.initiate(undefined, {subscribe:false,forceRefetch:true})).unwrap(), cfg);
        setState({ loading: false, data: res.data, error: pickError(res) });
        return res;
    }, []);
    return useMemo(() => ({ ...state, refetch }), [state, refetch]);
};

export const useGetGiftStyle = () => {
    const [state, setState] = useState<State<GiftStyleDTO>>({ loading: false });
    const refetch = useCallback(async (id: number, cfg?: RequestConfig) => {
        setState((s) => ({ ...s, loading: true }));
        const res = await legacyQuery(() => store.dispatch(giftApi.endpoints.getGiftStyleById.initiate(id, {subscribe:false,forceRefetch:true})).unwrap(), cfg);
        setState({ loading: false, data: res.data, error: pickError(res) });
        return res;
    }, []);
    return useMemo(() => ({ ...state, refetch }), [state, refetch]);
};

