import { useCallback, useMemo, useState } from 'react';
import { ReportApi } from '../api/api.ts';
import type {
    CreateReportDTO,
    ReportDTO,
    ReportFilterDTO,
    ReportReasonTypeDTO,
    ReportableEntityTypeDTO,
} from './types';
import type { State } from '@shared/types/store';
import type {RequestConfig} from "@shared/types";



const pickError = (res: any) =>
    res?.success ? undefined : res?.errors?.[0] || res?.details?.[0] || res?.message;

export const useReports = () => {
    const [state, setState] = useState<State<ReportDTO[]>>({ loading: false });
    const refetch = useCallback(async (cfg?: RequestConfig) => {
        setState((s) => ({ ...s, loading: true }));
        const res = await ReportApi.list(cfg);
        setState({ loading: false, data: res.data, error: pickError(res) });
        return res;
    }, []);
    return useMemo(() => ({ ...state, refetch }), [state, refetch]);
};

export const useReport = () => {
    const [state, setState] = useState<State<ReportDTO>>({ loading: false });
    const refetch = useCallback(async (id: number, cfg?: RequestConfig) => {
        setState((s) => ({ ...s, loading: true }));
        const res = await ReportApi.byId(id, cfg);
        setState({ loading: false, data: res.data, error: pickError(res) });
        return res;
    }, []);
    return useMemo(() => ({ ...state, refetch }), [state, refetch]);
};

export const useCreateReport = () => {
    const [state, setState] = useState<State<ReportDTO>>({ loading: false });
    const mutate = useCallback(async (body: CreateReportDTO, cfg?: RequestConfig) => {
        setState({ loading: true });
        const res = await ReportApi.create(body, cfg);
        setState({ loading: false, data: res.data, error: pickError(res) });
        return res;
    }, []);
    return useMemo(() => ({ ...state, mutate }), [state, mutate]);
};

export const useDeleteReport = () => {
    const [state, setState] = useState<State<void>>({ loading: false });
    const mutate = useCallback(async (id: number, cfg?: RequestConfig) => {
        setState({ loading: true });
        const res = await ReportApi.delete(id, cfg);
        setState({ loading: false, error: pickError(res) });
        return res;
    }, []);
    return useMemo(() => ({ ...state, mutate }), [state, mutate]);
};

export const useCloseReport = () => {
    const [state, setState] = useState<State<void>>({ loading: false });
    const mutate = useCallback(async (id: number, cfg?: RequestConfig) => {
        setState({ loading: true });
        const res = await ReportApi.close(id, cfg);
        setState({ loading: false, error: pickError(res) });
        return res;
    }, []);
    return useMemo(() => ({ ...state, mutate }), [state, mutate]);
};

export const useFilteredReports = () => {
    const [state, setState] = useState<State<ReportDTO[]>>({ loading: false });
    const refetch = useCallback(async (filter: ReportFilterDTO, cfg?: RequestConfig) => {
        setState((s) => ({ ...s, loading: true }));
        const res = await ReportApi.filter(filter, cfg);
        setState({ loading: false, data: res.data, error: pickError(res) });
        return res;
    }, []);
    return useMemo(() => ({ ...state, refetch }), [state, refetch]);
};

export const useReportsByReporter = () => {
    const [state, setState] = useState<State<ReportDTO[]>>({ loading: false });
    const refetch = useCallback(async (reporterId: number, cfg?: RequestConfig) => {
        setState((s) => ({ ...s, loading: true }));
        const res = await ReportApi.byReporter(reporterId, cfg);
        setState({ loading: false, data: res.data, error: pickError(res) });
        return res;
    }, []);
    return useMemo(() => ({ ...state, refetch }), [state, refetch]);
};

export const useOpenReports = () => {
    const [state, setState] = useState<State<ReportDTO[]>>({ loading: false });
    const refetch = useCallback(async (cfg?: RequestConfig) => {
        setState((s) => ({ ...s, loading: true }));
        const res = await ReportApi.open(cfg);
        setState({ loading: false, data: res.data, error: pickError(res) });
        return res;
    }, []);
    return useMemo(() => ({ ...state, refetch }), [state, refetch]);
};

export const useReportReasonTypes = () => {
    const [state, setState] = useState<State<ReportReasonTypeDTO[]>>({ loading: false });
    const refetch = useCallback(async (cfg?: RequestConfig) => {
        setState((s) => ({ ...s, loading: true }));
        const res = await ReportApi.reasonTypes(cfg);
        setState({ loading: false, data: res.data, error: pickError(res) });
        return res;
    }, []);
    return useMemo(() => ({ ...state, refetch }), [state, refetch]);
};

export const useReportReasonType = () => {
    const [state, setState] = useState<State<ReportReasonTypeDTO>>({ loading: false });
    const refetch = useCallback(async (id: number, cfg?: RequestConfig) => {
        setState((s) => ({ ...s, loading: true }));
        const res = await ReportApi.reasonTypeById(id, cfg);
        setState({ loading: false, data: res.data, error: pickError(res) });
        return res;
    }, []);
    return useMemo(() => ({ ...state, refetch }), [state, refetch]);
};

export const useReportableEntityTypes = () => {
    const [state, setState] = useState<State<ReportableEntityTypeDTO[]>>({ loading: false });
    const refetch = useCallback(async (cfg?: RequestConfig) => {
        setState((s) => ({ ...s, loading: true }));
        const res = await ReportApi.entityTypes(cfg);
        setState({ loading: false, data: res.data, error: pickError(res) });
        return res;
    }, []);
    return useMemo(() => ({ ...state, refetch }), [state, refetch]);
};

export const useReportableEntityType = () => {
    const [state, setState] = useState<State<ReportableEntityTypeDTO>>({ loading: false });
    const refetch = useCallback(async (id: number, cfg?: RequestConfig) => {
        setState((s) => ({ ...s, loading: true }));
        const res = await ReportApi.entityTypeById(id, cfg);
        setState({ loading: false, data: res.data, error: pickError(res) });
        return res;
    }, []);
    return useMemo(() => ({ ...state, refetch }), [state, refetch]);
};
