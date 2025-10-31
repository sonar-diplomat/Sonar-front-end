import { useCallback, useMemo, useState } from 'react';
import { Api } from '../api/api.ts';
import type {
    PurchaseSubscriptionDTO,
    SubscriptionFeatureDTO,
    SubscriptionPackDTO,
    SubscriptionPaymentDTO,
} from './types';
import type { State } from '@shared/types/store';



const pickError = (res: any) => res?.success ? undefined : res?.errors?.[0] || res?.details?.[0] || res?.message;

export const useSubscriptionPacks = () => {
    const [state, setState] = useState<State<SubscriptionPackDTO[]>>({ loading: false });
    const refetch = useCallback(async () => {
        setState((s) => ({ ...s, loading: true }));
        const res = await Api.getPacks();
        setState({ loading: false, data: res.data, error: pickError(res) });
        return res;
    }, []);
    return useMemo(() => ({ ...state, refetch }), [state, refetch]);
};

export const useSubscriptionPack = () => {
    const [state, setState] = useState<State<SubscriptionPackDTO>>({ loading: false });
    const refetch = useCallback(async (id: number) => {
        setState((s) => ({ ...s, loading: true }));
        const res = await Api.getPackById(id);
        setState({ loading: false, data: res.data, error: pickError(res) });
        return res;
    }, []);
    return useMemo(() => ({ ...state, refetch }), [state, refetch]);
};

export const useSubscriptionFeatures = () => {
    const [state, setState] = useState<State<SubscriptionFeatureDTO[]>>({ loading: false });
    const refetch = useCallback(async () => {
        setState((s) => ({ ...s, loading: true }));
        const res = await Api.getFeatures();
        setState({ loading: false, data: res.data, error: pickError(res) });
        return res;
    }, []);
    return useMemo(() => ({ ...state, refetch }), [state, refetch]);
};

export const useSubscriptionFeature = () => {
    const [state, setState] = useState<State<SubscriptionFeatureDTO>>({ loading: false });
    const refetch = useCallback(async (id: number) => {
        setState((s) => ({ ...s, loading: true }));
        const res = await Api.getFeatureById(id);
        setState({ loading: false, data: res.data, error: pickError(res) });
        return res;
    }, []);
    return useMemo(() => ({ ...state, refetch }), [state, refetch]);
};

export const useSubscriptionPayments = () => {
    const [state, setState] = useState<State<SubscriptionPaymentDTO[]>>({ loading: false });
    const refetch = useCallback(async () => {
        setState((s) => ({ ...s, loading: true }));
        const res = await Api.getPayments();
        setState({ loading: false, data: res.data, error: pickError(res) });
        return res;
    }, []);
    return useMemo(() => ({ ...state, refetch }), [state, refetch]);
};

export const useSubscriptionPayment = () => {
    const [state, setState] = useState<State<SubscriptionPaymentDTO>>({ loading: false });
    const refetch = useCallback(async (id: number) => {
        setState((s) => ({ ...s, loading: true }));
        const res = await Api.getPaymentById(id);
        setState({ loading: false, data: res.data, error: pickError(res) });
        return res;
    }, []);
    return useMemo(() => ({ ...state, refetch }), [state, refetch]);
};

export const usePurchaseSubscription = () => {
    const [state, setState] = useState<State<SubscriptionPaymentDTO>>({ loading: false });
    const mutate = useCallback(async (body: PurchaseSubscriptionDTO) => {
        setState({ loading: true });
        const res = await Api.purchase(body);
        setState({ loading: false, data: res.data, error: pickError(res) });
        return res;
    }, []);
    return useMemo(() => ({ ...state, mutate }), [state, mutate]);
};
