import { useCallback, useMemo, useState } from 'react'
import { Api } from '../api/api.ts'
import type { NonSensetiveUserDTO, User, UserUpdateDTO } from '@entities/User'
import type { State } from '@shared/types/store'

export const useGetUsers = () => {
    const [state, setState] = useState<State<User[]>>({ loading: false })
    const refetch = useCallback(async () => {
        setState((s) => ({ ...s, loading: true }))
        const res = await Api.list()
        setState({
            loading: false,
            data: res.data,
            error: res.success ? undefined : res.errors?.[0] || res.details?.[0] || res.message,
        })
        return res
    }, [])
    return useMemo(() => ({ ...state, refetch }), [state, refetch])
}

export const useGetUserById = () => {
    const [state, setState] = useState<State<NonSensetiveUserDTO>>({ loading: false })
    const refetch = useCallback(async (id: number) => {
        setState((s) => ({ ...s, loading: true }))
        const res = await Api.byId(id)
        setState({
            loading: false,
            data: res.data,
            error: res.success ? undefined : res.errors?.[0] || res.details?.[0] || res.message,
        })
        return res
    }, [])
    return useMemo(() => ({ ...state, refetch }), [state, refetch])
}

export const useUpdateUser = () => {
    const [state, setState] = useState<State<User>>({ loading: false })
    const mutate = useCallback(async (dto: UserUpdateDTO) => {
        setState({ loading: true })
        const res = await Api.update(dto)
        setState({
            loading: false,
            data: res.data,
            error: res.success ? undefined : res.errors?.[0] || res.details?.[0] || res.message,
        })
        return res
    }, [])
    return useMemo(() => ({ ...state, mutate }), [state, mutate])
}

export const useUpdateAvatar = () => {
    const [state, setState] = useState<State<void>>({ loading: false })
    const mutate = useCallback(async (file: File) => {
        setState({ loading: true })
        const res = await Api.updateAvatar(file)
        setState({ loading: false, error: res.success ? undefined : res.errors?.[0] || res.details?.[0] || res.message })
        return res
    }, [])
    return useMemo(() => ({ ...state, mutate }), [state, mutate])
}
