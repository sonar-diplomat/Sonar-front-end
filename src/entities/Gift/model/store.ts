import { useCallback, useMemo, useState } from 'react';
import { Api } from '../api/api';
import type { GiftResponseDTO, GiftStyleDTO, SendGiftDTO } from './types';
import type { State } from '@shared/types/store';
import type { RequestConfig } from '@shared/types';
import { withAuth } from '@shared/lib/auth/withAuth';
import type { SubscriptionPaymentDTO } from '@entities/Subscription';

const pickError = (res: any) =>
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
        const res = await withAuth(() => Api.received(cfg));
        setState({ loading: false, data: res.data, error: pickError(res) });
        return res;
    }, []);
    return useMemo(() => ({ ...state, refetch }), [state, refetch]);
};

export const useGetSentGifts = () => {
    const [state, setState] = useState<State<GiftResponseDTO[]>>({ loading: false });
    const refetch = useCallback(async (senderId?: number, cfg?: RequestConfig) => {
        setState((s) => ({ ...s, loading: true }));
        const res = await withAuth(() => Api.sent(senderId, cfg));
        setState({ loading: false, data: res.data, error: pickError(res) });
        return res;
    }, []);
    return useMemo(() => ({ ...state, refetch }), [state, refetch]);
};

export const useGetGift = () => {
    const [state, setState] = useState<State<GiftResponseDTO>>({ loading: false });
    const refetch = useCallback(async (id: number, cfg?: RequestConfig) => {
        setState((s) => ({ ...s, loading: true }));
        const res = await withAuth(() => Api.byId(id, cfg));
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
        const res = await Api.styles(cfg);
        setState({ loading: false, data: res.data, error: pickError(res) });
        return res;
    }, []);
    return useMemo(() => ({ ...state, refetch }), [state, refetch]);
};

export const useGetGiftStyle = () => {
    const [state, setState] = useState<State<GiftStyleDTO>>({ loading: false });
    const refetch = useCallback(async (id: number, cfg?: RequestConfig) => {
        setState((s) => ({ ...s, loading: true }));
        const res = await Api.styleById(id, cfg);
        setState({ loading: false, data: res.data, error: pickError(res) });
        return res;
    }, []);
    return useMemo(() => ({ ...state, refetch }), [state, refetch]);
};

