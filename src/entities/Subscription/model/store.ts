import { useCallback,useMemo,useState } from 'react';

import { legacyQuery } from '@shared/api/legacyQuery';
import { store } from '@shared/store';
import type { State } from '@shared/types/store';

import { Api } from '../api/api.ts';
import { subscriptionApi } from '../api/rtkApi';

import type {
PurchaseSubscriptionDTO,
SubscriptionFeatureDTO,
SubscriptionPackDTO,
SubscriptionPaymentDTO,
} from './types';



const pickError = (res: { success: boolean; errors?: string[]; details?: string[]; message?: string }) => res?.success ? undefined : res?.errors?.[0] || res?.details?.[0] || res?.message;

export const useSubscriptionPacks = () => {
    const [state, setState] = useState<State<SubscriptionPackDTO[]>>({ loading: false });
    const refetch = useCallback(async () => {
        setState((s) => ({ ...s, loading: true }));
        const res = await legacyQuery(() => store.dispatch(subscriptionApi.endpoints.getSubscriptionPacks.initiate(undefined, {subscribe:false,forceRefetch:true})).unwrap());
        setState({ loading: false, data: res.data, error: pickError(res) });
        return res;
    }, []);
    return useMemo(() => ({ ...state, refetch }), [state, refetch]);
};

export const useSubscriptionPack = () => {
    const [state, setState] = useState<State<SubscriptionPackDTO>>({ loading: false });
    const refetch = useCallback(async (id: number) => {
        setState((s) => ({ ...s, loading: true }));
        const res = await legacyQuery(() => store.dispatch(subscriptionApi.endpoints.getSubscriptionPack.initiate(id, {subscribe:false,forceRefetch:true})).unwrap());
        setState({ loading: false, data: res.data, error: pickError(res) });
        return res;
    }, []);
    return useMemo(() => ({ ...state, refetch }), [state, refetch]);
};

export const useSubscriptionFeatures = () => {
    const [state, setState] = useState<State<SubscriptionFeatureDTO[]>>({ loading: false });
    const refetch = useCallback(async () => {
        setState((s) => ({ ...s, loading: true }));
        const res = await legacyQuery(() => store.dispatch(subscriptionApi.endpoints.getSubscriptionFeatures.initiate(undefined, {subscribe:false,forceRefetch:true})).unwrap());
        setState({ loading: false, data: res.data, error: pickError(res) });
        return res;
    }, []);
    return useMemo(() => ({ ...state, refetch }), [state, refetch]);
};

export const useSubscriptionFeature = () => {
    const [state, setState] = useState<State<SubscriptionFeatureDTO>>({ loading: false });
    const refetch = useCallback(async (id: number) => {
        setState((s) => ({ ...s, loading: true }));
        const res = await legacyQuery(() => store.dispatch(subscriptionApi.endpoints.getSubscriptionFeature.initiate(id, {subscribe:false,forceRefetch:true})).unwrap());
        setState({ loading: false, data: res.data, error: pickError(res) });
        return res;
    }, []);
    return useMemo(() => ({ ...state, refetch }), [state, refetch]);
};

export const useSubscriptionPayments = () => {
    const [state, setState] = useState<State<SubscriptionPaymentDTO[]>>({ loading: false });
    const refetch = useCallback(async () => {
        setState((s) => ({ ...s, loading: true }));
        const res = await legacyQuery(() => store.dispatch(subscriptionApi.endpoints.getSubscriptionPayments.initiate(undefined, {subscribe:false,forceRefetch:true})).unwrap());
        setState({ loading: false, data: res.data, error: pickError(res) });
        return res;
    }, []);
    return useMemo(() => ({ ...state, refetch }), [state, refetch]);
};

export const useSubscriptionPayment = () => {
    const [state, setState] = useState<State<SubscriptionPaymentDTO>>({ loading: false });
    const refetch = useCallback(async (id: number) => {
        setState((s) => ({ ...s, loading: true }));
        const res = await legacyQuery(() => store.dispatch(subscriptionApi.endpoints.getSubscriptionPayment.initiate(id, {subscribe:false,forceRefetch:true})).unwrap());
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
