import { useCallback,useMemo,useState } from 'react';

import type { ActiveSessionDTO,LoginResponseDTO,RefreshTokenResponse } from '@features/auth';
import { legacyQuery } from '@shared/api/legacyQuery';
import { withAuth } from '@shared/lib/auth/withAuth';
import { store } from '@shared/store';
import type { RequestConfig } from '@shared/types';
import type { State } from '@shared/types/store';

import { AuthDistributorApi,DistributorApi,DistributorMasterApi } from '../api/api';
import { distributionApi } from '../api/rtkApi';

import type {
ArtistRegistrationRequestDTO,
CreateDistributorDTO,
DistributorAccountChangePasswordDTO,
DistributorAccountDTO,
DistributorAccountRegisterDTO,
DistributorDTO,
UpdateDistributorDTO,
} from './types';

const pickError = (res: { success: boolean; errors?: string[]; details?: string[]; message?: string }) =>
    res?.success ? undefined : res?.errors?.[0] || res?.details?.[0] || res?.message;

// Distributor hooks
export const useCreateDistributor = () => {
    const [state, setState] = useState<State<DistributorDTO>>({ loading: false });
    const mutate = useCallback(async (dto: CreateDistributorDTO, cfg?: RequestConfig) => {
        setState({ loading: true });
        const res = await withAuth(() => DistributorApi.create(dto, cfg));
        setState({ loading: false, data: res.data, error: pickError(res) });
        return res;
    }, []);
    return useMemo(() => ({ ...state, mutate }), [state, mutate]);
};

export const useGetDistributors = () => {
    const [state, setState] = useState<State<DistributorDTO[]>>({ loading: false });
    const refetch = useCallback(async (cfg?: RequestConfig) => {
        setState((s) => ({ ...s, loading: true }));
        const res = await withAuth(() => legacyQuery(() => store.dispatch(distributionApi.endpoints.getDistributors.initiate(undefined, {subscribe:false,forceRefetch:true})).unwrap(), cfg));
        setState({ loading: false, data: res.data, error: pickError(res) });
        return res;
    }, []);
    return useMemo(() => ({ ...state, refetch }), [state, refetch]);
};

export const useGetDistributor = () => {
    const [state, setState] = useState<State<DistributorDTO>>({ loading: false });
    const refetch = useCallback(async (id: number, cfg?: RequestConfig) => {
        setState((s) => ({ ...s, loading: true }));
        const res = await legacyQuery(() => store.dispatch(distributionApi.endpoints.getDistributor.initiate(id, {subscribe:false,forceRefetch:true})).unwrap(), cfg);
        setState({ loading: false, data: res.data, error: pickError(res) });
        return res;
    }, []);
    return useMemo(() => ({ ...state, refetch }), [state, refetch]);
};

export const useUpdateDistributor = () => {
    const [state, setState] = useState<State<DistributorDTO>>({ loading: false });
    const mutate = useCallback(async (id: number, dto: UpdateDistributorDTO, cfg?: RequestConfig) => {
        setState({ loading: true });
        const res = await withAuth(() => DistributorApi.update(id, dto, cfg));
        setState({ loading: false, data: res.data, error: pickError(res) });
        return res;
    }, []);
    return useMemo(() => ({ ...state, mutate }), [state, mutate]);
};

export const useDeleteDistributor = () => {
    const [state, setState] = useState<State<void>>({ loading: false });
    const mutate = useCallback(async (id: number, cfg?: RequestConfig) => {
        setState({ loading: true });
        const res = await withAuth(() => DistributorApi.delete(id, cfg));
        setState({ loading: false, error: pickError(res) });
        return res;
    }, []);
    return useMemo(() => ({ ...state, mutate }), [state, mutate]);
};

export const useUpdateDistributorKey = () => {
    const [state, setState] = useState<State<string>>({ loading: false });
    const mutate = useCallback(async (id: number, cfg?: RequestConfig) => {
        setState({ loading: true });
        const res = await withAuth(() => DistributorApi.updateKey(id, cfg));
        setState({ loading: false, data: res.data, error: pickError(res) });
        return res;
    }, []);
    return useMemo(() => ({ ...state, mutate }), [state, mutate]);
};

export const useGetArtistRequests = () => {
    const [state, setState] = useState<State<ArtistRegistrationRequestDTO[]>>({ loading: false });
    const refetch = useCallback(async (cfg?: RequestConfig) => {
        setState((s) => ({ ...s, loading: true }));
        const res = await withAuth(() => legacyQuery(() => store.dispatch(distributionApi.endpoints.getArtistRequests.initiate(undefined, {subscribe:false,forceRefetch:true})).unwrap(), cfg));
        setState({ loading: false, data: res.data, error: pickError(res) });
        return res;
    }, []);
    return useMemo(() => ({ ...state, refetch }), [state, refetch]);
};

export const useGetArtistRequest = () => {
    const [state, setState] = useState<State<ArtistRegistrationRequestDTO>>({ loading: false });
    const refetch = useCallback(async (requestId: number, cfg?: RequestConfig) => {
        setState((s) => ({ ...s, loading: true }));
        const res = await withAuth(() => legacyQuery(() => store.dispatch(distributionApi.endpoints.getArtistRequest.initiate(requestId, {subscribe:false,forceRefetch:true})).unwrap(), cfg));
        setState({ loading: false, data: res.data, error: pickError(res) });
        return res;
    }, []);
    return useMemo(() => ({ ...state, refetch }), [state, refetch]);
};

export const useResolveArtistRequest = () => {
    const [state, setState] = useState<State<void>>({ loading: false });
    const mutate = useCallback(async (requestId: number, approve: boolean, cfg?: RequestConfig) => {
        setState({ loading: true });
        const res = await withAuth(() => DistributorApi.resolveArtistRequest(requestId, approve, cfg));
        setState({ loading: false, error: pickError(res) });
        return res;
    }, []);
    return useMemo(() => ({ ...state, mutate }), [state, mutate]);
};

// AuthDistributor hooks
export const useTerminateDistributorSession = () => {
    const [state, setState] = useState<State<void>>({ loading: false });
    const mutate = useCallback(async (id: number, cfg?: RequestConfig) => {
        setState({ loading: true });
        const res = await AuthDistributorApi.terminateSession(id, cfg);
        setState({ loading: false, error: pickError(res) });
        return res;
    }, []);
    return useMemo(() => ({ ...state, mutate }), [state, mutate]);
};

export const useRegisterDistributorAccount = () => {
    const [state, setState] = useState<State<DistributorAccountDTO>>({ loading: false });
    const mutate = useCallback(async (dto: DistributorAccountRegisterDTO, cfg?: RequestConfig) => {
        setState({ loading: true });
        const res = await withAuth(() => AuthDistributorApi.register(dto, cfg));
        setState({ loading: false, data: res.data, error: pickError(res) });
        return res;
    }, []);
    return useMemo(() => ({ ...state, mutate }), [state, mutate]);
};

export const useDistributorLogin = () => {
    const [state, setState] = useState<State<LoginResponseDTO>>({ loading: false });
    const mutate = useCallback(async (email: string, password: string, deviceName: string) => {
        setState({ loading: true });
        const res = await AuthDistributorApi.login(email, password, deviceName);
        setState({ loading: false, data: res.data, error: pickError(res) });
        return res;
    }, []);
    return useMemo(() => ({ ...state, mutate }), [state, mutate]);
};

export const useDistributorRefreshToken = () => {
    const [state, setState] = useState<State<RefreshTokenResponse>>({ loading: false });
    const mutate = useCallback(async (token: string) => {
        setState({ loading: true });
        const res = await AuthDistributorApi.refreshToken(token);
        setState({ loading: false, data: res.data, error: pickError(res) });
        return res;
    }, []);
    return useMemo(() => ({ ...state, mutate }), [state, mutate]);
};

export const useDistributorRevokeSession = () => {
    const [state, setState] = useState<State<void>>({ loading: false });
    const mutate = useCallback(async (sessionId: number, cfg?: RequestConfig) => {
        setState({ loading: true });
        const res = await withAuth(() => AuthDistributorApi.revokeSession(sessionId, cfg));
        setState({ loading: false, error: pickError(res) });
        return res;
    }, []);
    return useMemo(() => ({ ...state, mutate }), [state, mutate]);
};

export const useDistributorRevokeAllSessions = () => {
    const [state, setState] = useState<State<void>>({ loading: false });
    const mutate = useCallback(async (cfg?: RequestConfig) => {
        setState({ loading: true });
        const res = await withAuth(() => AuthDistributorApi.revokeAllSessions(cfg));
        setState({ loading: false, error: pickError(res) });
        return res;
    }, []);
    return useMemo(() => ({ ...state, mutate }), [state, mutate]);
};

export const useGetDistributorSessions = () => {
    const [state, setState] = useState<State<ActiveSessionDTO[]>>({ loading: false });
    const refetch = useCallback(async (cfg?: RequestConfig) => {
        setState((s) => ({ ...s, loading: true }));
        const res = await withAuth(() => legacyQuery(() => store.dispatch(distributionApi.endpoints.getDistributorSessions.initiate(undefined, {subscribe:false,forceRefetch:true})).unwrap(), cfg));
        setState({ loading: false, data: res.data, error: pickError(res) });
        return res;
    }, []);
    return useMemo(() => ({ ...state, refetch }), [state, refetch]);
};

// DistributorMaster hooks
export const useDeleteDistributorAccount = () => {
    const [state, setState] = useState<State<void>>({ loading: false });
    const mutate = useCallback(async (id: number, cfg?: RequestConfig) => {
        setState({ loading: true });
        const res = await withAuth(() => DistributorMasterApi.deleteAccount(id, cfg));
        setState({ loading: false, error: pickError(res) });
        return res;
    }, []);
    return useMemo(() => ({ ...state, mutate }), [state, mutate]);
};

export const useChangeDistributorUsername = () => {
    const [state, setState] = useState<State<void>>({ loading: false });
    const mutate = useCallback(async (id: number, newUserName: string, cfg?: RequestConfig) => {
        setState({ loading: true });
        const res = await withAuth(() => DistributorMasterApi.changeUsername(id, newUserName, cfg));
        setState({ loading: false, error: pickError(res) });
        return res;
    }, []);
    return useMemo(() => ({ ...state, mutate }), [state, mutate]);
};

export const useGetDistributorAccount = () => {
    const [state, setState] = useState<State<DistributorAccountDTO>>({ loading: false });
    const refetch = useCallback(async (id: number, cfg?: RequestConfig) => {
        setState((s) => ({ ...s, loading: true }));
        const res = await withAuth(() => legacyQuery(() => store.dispatch(distributionApi.endpoints.getDistributorAccount.initiate(id, {subscribe:false,forceRefetch:true})).unwrap(), cfg));
        setState({ loading: false, data: res.data, error: pickError(res) });
        return res;
    }, []);
    return useMemo(() => ({ ...state, refetch }), [state, refetch]);
};

export const useChangeDistributorEmail = () => {
    const [state, setState] = useState<State<void>>({ loading: false });
    const mutate = useCallback(async (id: number, newEmail: string, cfg?: RequestConfig) => {
        setState({ loading: true });
        const res = await withAuth(() => DistributorMasterApi.changeEmail(id, newEmail, cfg));
        setState({ loading: false, error: pickError(res) });
        return res;
    }, []);
    return useMemo(() => ({ ...state, mutate }), [state, mutate]);
};

export const useChangeDistributorPassword = () => {
    const [state, setState] = useState<State<void>>({ loading: false });
    const mutate = useCallback(async (id: number, dto: DistributorAccountChangePasswordDTO, cfg?: RequestConfig) => {
        setState({ loading: true });
        const res = await withAuth(() => DistributorMasterApi.changePassword(id, dto, cfg));
        setState({ loading: false, error: pickError(res) });
        return res;
    }, []);
    return useMemo(() => ({ ...state, mutate }), [state, mutate]);
};

