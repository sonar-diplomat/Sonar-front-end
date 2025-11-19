import { useCallback, useMemo, useState } from 'react';
import { DistributorApi, AuthDistributorApi, DistributorMasterApi } from '../api/api';
import type {
    DistributorDTO,
    CreateDistributorDTO,
    UpdateDistributorDTO,
    DistributorAccountDTO,
    DistributorAccountRegisterDTO,
    DistributorAccountChangePasswordDTO,
    ArtistRegistrationRequestDTO,
} from './types';
import type { State } from '@shared/types/store';
import type { RequestConfig } from '@shared/types';
import { withAuth } from '@shared/lib/auth/withAuth';
import type { LoginResponseDTO, RefreshTokenResponse, ActiveSessionDTO } from '@features/auth';

const pickError = (res: any) =>
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
        const res = await withAuth(() => DistributorApi.list(cfg));
        setState({ loading: false, data: res.data, error: pickError(res) });
        return res;
    }, []);
    return useMemo(() => ({ ...state, refetch }), [state, refetch]);
};

export const useGetDistributor = () => {
    const [state, setState] = useState<State<DistributorDTO>>({ loading: false });
    const refetch = useCallback(async (id: number, cfg?: RequestConfig) => {
        setState((s) => ({ ...s, loading: true }));
        const res = await DistributorApi.byId(id, cfg);
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
        const res = await withAuth(() => DistributorApi.getArtistRequest(cfg));
        setState({ loading: false, data: res.data, error: pickError(res) });
        return res;
    }, []);
    return useMemo(() => ({ ...state, refetch }), [state, refetch]);
};

export const useGetArtistRequest = () => {
    const [state, setState] = useState<State<ArtistRegistrationRequestDTO>>({ loading: false });
    const refetch = useCallback(async (requestId: number, cfg?: RequestConfig) => {
        setState((s) => ({ ...s, loading: true }));
        const res = await withAuth(() => DistributorApi.getArtistRequestById(requestId, cfg));
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
        const res = await withAuth(() => AuthDistributorApi.getSessions(cfg));
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
        const res = await withAuth(() => DistributorMasterApi.getAccount(id, cfg));
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

