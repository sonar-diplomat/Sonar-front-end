import { useCallback, useMemo, useState } from 'react'
import { Api } from '../api/api.ts'
import type { NonSensetiveUserDTO, User, UserUpdateDTO } from '@entities/User'
import type { State } from '@shared/types/store'
import type { RequestConfig } from '@shared/types'
import { withAuth } from '@shared/lib/auth/withAuth'

const pickError = (res: any) =>
    res?.success ? undefined : res?.errors?.[0] || res?.details?.[0] || res?.message

export const useGetUsers = () => {
    const [state, setState] = useState<State<User[]>>({ loading: false })
    const refetch = useCallback(async (cfg?: RequestConfig) => {
        setState((s) => ({ ...s, loading: true }))
        const res = await Api.list(cfg)
        setState({
            loading: false,
            data: res.data,
            error: pickError(res),
        })
        return res
    }, [])
    return useMemo(() => ({ ...state, refetch }), [state, refetch])
}

export const useGetUserById = () => {
    const [state, setState] = useState<State<NonSensetiveUserDTO>>({ loading: false })
    const refetch = useCallback(async (id: number, cfg?: RequestConfig) => {
        setState((s) => ({ ...s, loading: true }))
        const res = await Api.byId(id, cfg)
        setState({
            loading: false,
            data: res.data,
            error: pickError(res),
        })
        return res
    }, [])
    return useMemo(() => ({ ...state, refetch }), [state, refetch])
}

export const useUpdateUser = () => {
    const [state, setState] = useState<State<User>>({ loading: false })
    const mutate = useCallback(async (dto: UserUpdateDTO, cfg?: RequestConfig) => {
        setState({ loading: true })
        const res = await Api.update(dto, cfg)
        setState({
            loading: false,
            data: res.data,
            error: pickError(res),
        })
        return res
    }, [])
    return useMemo(() => ({ ...state, mutate }), [state, mutate])
}

export const useUpdateAvatar = () => {
    const [state, setState] = useState<State<void>>({ loading: false })
    const mutate = useCallback(async (file: File, cfg?: RequestConfig) => {
        setState({ loading: true })
        const res = await Api.updateAvatar(file, cfg)
        setState({ loading: false, error: pickError(res) })
        return res
    }, [])
    return useMemo(() => ({ ...state, mutate }), [state, mutate])
}

export const useUpdateUserVisibility = () => {
    const [state, setState] = useState<State<void>>({ loading: false })
    const mutate = useCallback(async (collectionId: number, visibilityStatusId: number, cfg?: RequestConfig) => {
        setState({ loading: true })
        const res = await withAuth(() => Api.updateVisibility(collectionId, visibilityStatusId, cfg))
        setState({ loading: false, error: pickError(res) })
        return res
    }, [])
    return useMemo(() => ({ ...state, mutate }), [state, mutate])
}
