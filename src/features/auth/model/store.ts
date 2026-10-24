function authError(error: unknown) { const value = error && typeof error === 'object' ? error as {status?: number;message?: string;data?: {message?: string;errors?: string[];details?: string[]}} : {}; return value; }
import { useCallback,useMemo } from 'react'

import type {
ConfirmEmailChangeDTO,
ConfirmPasswordChangeDTO,
ForgotPasswordDTO,
ResetPasswordDTO,
UserRegisterDTO,
Verify2FaDTO,
} from '@features/auth'
import {
useConfirmEmailChangeMutation,
useConfirmPasswordChangeMutation,
useForgotPasswordMutation,
useGetSessionsQuery,
useLoginMutation,
useRefreshTokenMutation,
useRegisterMutation,
useRequestEmailChangeMutation,
useRequestPasswordChangeMutation,
useResetPasswordMutation,
useRevokeAllSessionsMutation,
useRevokeSessionMutation,
useVerify2FAMutation,
} from '@shared/api'
import { setCredentials,updateTokens } from '@shared/store/features/auth/authSlice'
import { useAppDispatch } from '@shared/store/hooks'

export const useRegister = () => {
    const [trigger, result] = useRegisterMutation()
    const mutate = useCallback(async (dto: UserRegisterDTO) => {
        try {
            await trigger(dto).unwrap()
            return { success: true, data: undefined }
        } catch (caught: unknown) {
            const error = authError(caught)
            const errorMsg = error?.data?.message || error?.message || 'Registration failed'
            return {
                success: false,
                status: error?.status || 400,
                message: errorMsg,
                errors: error?.data?.errors || [errorMsg],
                details: error?.data?.details,
            }
        }
    }, [trigger])
    return useMemo(() => ({
        loading: result.isLoading,
        error: result.error ? authError(result.error)?.data?.message || authError(result.error)?.message : undefined,
        mutate,
    }), [result.isLoading, result.error, mutate])
}

export const useLogin = () => {
    const dispatch = useAppDispatch()
    const [trigger, result] = useLoginMutation()
    const mutate = useCallback(async (userIdentifier: string, password: string, deviceName: string) => {
        try {
            const data = await trigger({ userIdentifier, password, deviceName }).unwrap()
            // Обновляем Redux state и localStorage
            if (data) {
                dispatch(setCredentials(data))
            }
            return { success: true, data }
        } catch (caught: unknown) {
            const error = authError(caught)
            const errorMsg = error?.data?.message || error?.message || 'Login failed'
            return {
                success: false,
                status: error?.status || 400,
                message: errorMsg,
                errors: error?.data?.errors || [errorMsg],
                details: error?.data?.details,
            }
        }
    }, [trigger, dispatch])
    return useMemo(() => ({
        loading: result.isLoading,
        data: result.data,
        error: result.error ? authError(result.error)?.data?.message || authError(result.error)?.message : undefined,
        mutate,
    }), [result.isLoading, result.data, result.error, mutate])
}

export const useVerify2FA = () => {
    const dispatch = useAppDispatch()
    const [trigger, result] = useVerify2FAMutation()
    const mutate = useCallback(async (dto: Verify2FaDTO, deviceName: string) => {
        try {
            const data = await trigger({ dto, deviceName }).unwrap()
            // Обновляем Redux state и localStorage
            // Verify2FA возвращает RefreshTokenResponse (только токены, без sessionId)
            if (data) {
                dispatch(updateTokens({
                    accessToken: data.newAccessToken,
                    refreshToken: data.refreshToken,
                }))
            }
            return { success: true, data }
        } catch (caught: unknown) {
            const error = authError(caught)
            const errorMsg = error?.data?.message || error?.message || '2FA verification failed'
            return {
                success: false,
                status: error?.status || 400,
                message: errorMsg,
                errors: error?.data?.errors || [errorMsg],
                details: error?.data?.details,
            }
        }
    }, [trigger, dispatch])
    return useMemo(() => ({
        loading: result.isLoading,
        data: result.data,
        error: result.error ? authError(result.error)?.data?.message || authError(result.error)?.message : undefined,
        mutate,
    }), [result.isLoading, result.data, result.error, mutate])
}

export const useRefreshToken = () => {
    const dispatch = useAppDispatch()
    const [trigger, result] = useRefreshTokenMutation()
    const mutate = useCallback(async (refreshToken: string) => {
        try {
            const data = await trigger(refreshToken).unwrap()
            // Обновляем Redux state и localStorage
            if (data) {
                dispatch(updateTokens({
                    accessToken: data.newAccessToken,
                    refreshToken: data.refreshToken,
                }))
            }
            return { success: true, data }
        } catch (caught: unknown) {
            const error = authError(caught)
            const errorMsg = error?.data?.message || error?.message || 'Token refresh failed'
            return {
                success: false,
                status: error?.status || 401,
                message: errorMsg,
                errors: error?.data?.errors || [errorMsg],
                details: error?.data?.details,
            }
        }
    }, [trigger, dispatch])
    return useMemo(() => ({
        loading: result.isLoading,
        data: result.data,
        error: result.error ? authError(result.error)?.data?.message || authError(result.error)?.message : undefined,
        mutate,
    }), [result.isLoading, result.data, result.error, mutate])
}

export const useRequestEmailChange = () => {
    const [trigger, result] = useRequestEmailChangeMutation()
    const mutate = useCallback(async (newEmail: string) => {
        try {
            await trigger(newEmail).unwrap()
            return { success: true, data: undefined }
        } catch (caught: unknown) {
            const error = authError(caught)
            const errorMsg = error?.data?.message || error?.message || 'Request email change failed'
            return {
                success: false,
                status: error?.status || 400,
                message: errorMsg,
                errors: error?.data?.errors || [errorMsg],
                details: error?.data?.details,
            }
        }
    }, [trigger])
    return useMemo(() => ({
        loading: result.isLoading,
        error: result.error ? authError(result.error)?.data?.message || authError(result.error)?.message : undefined,
        mutate,
    }), [result.isLoading, result.error, mutate])
}

export const useConfirmEmailChange = () => {
    const [trigger, result] = useConfirmEmailChangeMutation()
    const mutate = useCallback(async (dto: ConfirmEmailChangeDTO) => {
        try {
            await trigger(dto).unwrap()
            return { success: true, data: undefined }
        } catch (caught: unknown) {
            const error = authError(caught)
            const errorMsg = error?.data?.message || error?.message || 'Confirm email change failed'
            return {
                success: false,
                status: error?.status || 400,
                message: errorMsg,
                errors: error?.data?.errors || [errorMsg],
                details: error?.data?.details,
            }
        }
    }, [trigger])
    return useMemo(() => ({
        loading: result.isLoading,
        error: result.error ? authError(result.error)?.data?.message || authError(result.error)?.message : undefined,
        mutate,
    }), [result.isLoading, result.error, mutate])
}

export const useConfirmPasswordChange = () => {
    const [trigger, result] = useConfirmPasswordChangeMutation()
    const mutate = useCallback(async (dto: ConfirmPasswordChangeDTO) => {
        try {
            await trigger(dto).unwrap()
            return { success: true, data: undefined }
        } catch (caught: unknown) {
            const error = authError(caught)
            const errorMsg = error?.data?.message || error?.message || 'Confirm password change failed'
            return {
                success: false,
                status: error?.status || 400,
                message: errorMsg,
                errors: error?.data?.errors || [errorMsg],
                details: error?.data?.details,
            }
        }
    }, [trigger])
    return useMemo(() => ({
        loading: result.isLoading,
        error: result.error ? authError(result.error)?.data?.message || authError(result.error)?.message : undefined,
        mutate,
    }), [result.isLoading, result.error, mutate])
}

export const useRequestPasswordChange = () => {
    const [trigger, result] = useRequestPasswordChangeMutation()
    const mutate = useCallback(async () => {
        try {
            await trigger().unwrap()
            return { success: true, data: undefined }
        } catch (caught: unknown) {
            const error = authError(caught)
            const errorMsg = error?.data?.message || error?.message || 'Request password change failed'
            return {
                success: false,
                status: error?.status || 400,
                message: errorMsg,
                errors: error?.data?.errors || [errorMsg],
                details: error?.data?.details,
            }
        }
    }, [trigger])
    return useMemo(() => ({
        loading: result.isLoading,
        error: result.error ? authError(result.error)?.data?.message || authError(result.error)?.message : undefined,
        mutate,
    }), [result.isLoading, result.error, mutate])
}

export const useForgotPassword = () => {
    const [trigger, result] = useForgotPasswordMutation()
    const mutate = useCallback(async (dto: ForgotPasswordDTO) => {
        try {
            await trigger(dto).unwrap()
            return { success: true, data: undefined }
        } catch (caught: unknown) {
            const error = authError(caught)
            const errorMsg = error?.data?.message || error?.message || 'Forgot password request failed'
            return {
                success: false,
                status: error?.status || 400,
                message: errorMsg,
                errors: error?.data?.errors || [errorMsg],
                details: error?.data?.details,
            }
        }
    }, [trigger])
    return useMemo(() => ({
        loading: result.isLoading,
        error: result.error ? authError(result.error)?.data?.message || authError(result.error)?.message : undefined,
        mutate,
    }), [result.isLoading, result.error, mutate])
}

export const useResetPassword = () => {
    const [trigger, result] = useResetPasswordMutation()
    const mutate = useCallback(async (dto: ResetPasswordDTO) => {
        try {
            await trigger(dto).unwrap()
            return { success: true, data: undefined }
        } catch (caught: unknown) {
            const error = authError(caught)
            const errorMsg = error?.data?.message || error?.message || 'Reset password failed'
            return {
                success: false,
                status: error?.status || 400,
                message: errorMsg,
                errors: error?.data?.errors || [errorMsg],
                details: error?.data?.details,
            }
        }
    }, [trigger])
    return useMemo(() => ({
        loading: result.isLoading,
        error: result.error ? authError(result.error)?.data?.message || authError(result.error)?.message : undefined,
        mutate,
    }), [result.isLoading, result.error, mutate])
}

export const useSessions = () => {
    const { data, isLoading, error, refetch: refetchQuery } = useGetSessionsQuery(undefined)
    const [revokeSessionTrigger] = useRevokeSessionMutation()
    const [revokeAllSessionsTrigger] = useRevokeAllSessionsMutation()
    
    const refetch = useCallback(async () => {
        const result = await refetchQuery()
        if (result.data) {
            return { success: true, data: result.data }
        }
        return {
            success: false,
            status: 400,
            message: 'Failed to fetch sessions',
            errors: ['Failed to fetch sessions'],
        }
    }, [refetchQuery])
    
    const revoke = useCallback(async (sessionId: number) => {
        try {
            await revokeSessionTrigger(sessionId).unwrap()
            await refetchQuery()
            return { success: true, data: undefined }
        } catch (caught: unknown) {
            const error = authError(caught)
            const errorMsg = error?.data?.message || error?.message || 'Revoke session failed'
            return {
                success: false,
                status: error?.status || 400,
                message: errorMsg,
                errors: error?.data?.errors || [errorMsg],
                details: error?.data?.details,
            }
        }
    }, [revokeSessionTrigger, refetchQuery])
    
    const revokeAll = useCallback(async () => {
        try {
            await revokeAllSessionsTrigger().unwrap()
            await refetchQuery()
            return { success: true, data: undefined }
        } catch (caught: unknown) {
            const error = authError(caught)
            const errorMsg = error?.data?.message || error?.message || 'Revoke all sessions failed'
            return {
                success: false,
                status: error?.status || 400,
                message: errorMsg,
                errors: error?.data?.errors || [errorMsg],
                details: error?.data?.details,
            }
        }
    }, [revokeAllSessionsTrigger, refetchQuery])
    
    return useMemo(() => ({
        loading: isLoading,
        data: data,
        error: error ? (authError(error)?.data?.message || authError(error)?.message) : undefined,
        refetch,
        revoke,
        revokeAll,
    }), [isLoading, data, error, refetch, revoke, revokeAll])
}
