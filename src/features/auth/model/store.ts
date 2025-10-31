import { useCallback, useMemo, useState } from 'react'
import { Api } from '@features/auth'
import type {
    ActiveSessionDTO,
    ConfirmEmailChangeDTO,
    ConfirmPasswordChangeDTO,
    LoginResponseDTO,
    RefreshTokenResponse,
    UserRegisterDTO,
    Verify2FaDTO,
    Verify2FaResponseDTO,
} from '@features/auth'
import type {State} from "@shared/types/store.ts";



export const useRegister = () => {
    const [state, setState] = useState<State<void>>({ loading: false })
    const mutate = useCallback(async (dto: UserRegisterDTO) => {
        setState({ loading: true })
        const res = await Api.register(dto)
        setState({ loading: false, error: res.success ? undefined : res.errors?.[0] || res.details?.[0] || res.message })
        return res
    }, [])
    return useMemo(() => ({ ...state, mutate }), [state, mutate])
}

export const useLogin = () => {
    const [state, setState] = useState<State<LoginResponseDTO>>({ loading: false })
    const mutate = useCallback(async (userIdentifier: string, password: string, deviceName: string) => {
        setState({ loading: true })
        const res = await Api.login(userIdentifier, password, deviceName)
        setState({
            loading: false,
            data: res.data,
            error: res.success ? undefined : res.errors?.[0] || res.details?.[0] || res.message,
        })
        return res
    }, [])
    return useMemo(() => ({ ...state, mutate }), [state, mutate])
}

export const useVerify2FA = () => {
    const [state, setState] = useState<State<Verify2FaResponseDTO>>({ loading: false })
    const mutate = useCallback(async (dto: Verify2FaDTO, deviceName: string) => {
        setState({ loading: true })
        const res = await Api.verify2FA(dto, deviceName)
        setState({
            loading: false,
            data: res.data,
            error: res.success ? undefined : res.errors?.[0] || res.details?.[0] || res.message,
        })
        return res
    }, [])
    return useMemo(() => ({ ...state, mutate }), [state, mutate])
}

export const useRefreshToken = () => {
    const [state, setState] = useState<State<RefreshTokenResponse>>({ loading: false })
    const mutate = useCallback(async (refreshToken: string) => {
        setState({ loading: true })
        const res = await Api.refreshToken(refreshToken)
        setState({
            loading: false,
            data: res.data,
            error: res.success ? undefined : res.errors?.[0] || res.details?.[0] || res.message,
        })
        return res
    }, [])
    return useMemo(() => ({ ...state, mutate }), [state, mutate])
}

export const useRequestEmailChange = () => {
    const [state, setState] = useState<State<void>>({ loading: false })
    const mutate = useCallback(async (newEmail: string) => {
        setState({ loading: true })
        const res = await Api.requestEmailChange(newEmail)
        setState({ loading: false, error: res.success ? undefined : res.errors?.[0] || res.details?.[0] || res.message })
        return res
    }, [])
    return useMemo(() => ({ ...state, mutate }), [state, mutate])
}

export const useConfirmEmailChange = () => {
    const [state, setState] = useState<State<void>>({ loading: false })
    const mutate = useCallback(async (dto: ConfirmEmailChangeDTO) => {
        setState({ loading: true })
        const res = await Api.confirmEmailChange(dto)
        setState({ loading: false, error: res.success ? undefined : res.errors?.[0] || res.details?.[0] || res.message })
        return res
    }, [])
    return useMemo(() => ({ ...state, mutate }), [state, mutate])
}

export const useConfirmPasswordChange = () => {
    const [state, setState] = useState<State<void>>({ loading: false })
    const mutate = useCallback(async (dto: ConfirmPasswordChangeDTO) => {
        setState({ loading: true })
        const res = await Api.confirmPasswordChange(dto)
        setState({ loading: false, error: res.success ? undefined : res.errors?.[0] || res.details?.[0] || res.message })
        return res
    }, [])
    return useMemo(() => ({ ...state, mutate }), [state, mutate])
}

export const useRequestPasswordChange = () => {
    const [state, setState] = useState<State<void>>({ loading: false })
    const mutate = useCallback(async () => {
        setState({ loading: true })
        const res = await Api.requestPasswordChange()
        setState({ loading: false, error: res.success ? undefined : res.errors?.[0] || res.details?.[0] || res.message })
        return res
    }, [])
    return useMemo(() => ({ ...state, mutate }), [state, mutate])
}

export const useSessions = () => {
    const [state, setState] = useState<State<ActiveSessionDTO[]>>({ loading: false })
    const refetch = useCallback(async () => {
        setState((s) => ({ ...s, loading: true }))
        const res = await Api.getSessions()
        setState({
            loading: false,
            data: res.data,
            error: res.success ? undefined : res.errors?.[0] || res.details?.[0] || res.message,
        })
        return res
    }, [])
    const revoke = useCallback(async (sessionId: number) => {
        const res = await Api.revokeSession(sessionId)
        if (res.success) await refetch()
        return res
    }, [refetch])
    const revokeAll = useCallback(async () => {
        const res = await Api.revokeAllSessions()
        if (res.success) await refetch()
        return res
    }, [refetch])
    return useMemo(() => ({ ...state, refetch, revoke, revokeAll }), [state, refetch, revoke, revokeAll])
}
