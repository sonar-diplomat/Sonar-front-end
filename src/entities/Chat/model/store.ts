import { useCallback, useMemo, useState } from 'react';
import { Api } from '../api/api';
import type { CreateChatDTO, MessageDTO } from './types';
import type { State } from '@shared/types/store';
import type { RequestConfig } from '@shared/types';
import { withAuth } from '@shared/lib/auth/withAuth';

const pickError = (res: any) =>
    res?.success ? undefined : res?.errors?.[0] || res?.details?.[0] || res?.message;

export const useCreateChat = () => {
    const [state, setState] = useState<State<void>>({ loading: false });
    const mutate = useCallback(async (dto: CreateChatDTO, cfg?: RequestConfig) => {
        setState({ loading: true });
        const res = await withAuth(() => Api.create(dto, cfg));
        setState({ loading: false, error: pickError(res) });
        return res;
    }, []);
    return useMemo(() => ({ ...state, mutate }), [state, mutate]);
};

export const useSendMessage = () => {
    const [state, setState] = useState<State<void>>({ loading: false });
    const mutate = useCallback(async (chatId: number, message: MessageDTO, cfg?: RequestConfig) => {
        setState({ loading: true });
        const res = await withAuth(() => Api.sendMessage(chatId, message, cfg));
        setState({ loading: false, error: pickError(res) });
        return res;
    }, []);
    return useMemo(() => ({ ...state, mutate }), [state, mutate]);
};

export const useDeleteMessage = () => {
    const [state, setState] = useState<State<void>>({ loading: false });
    const mutate = useCallback(async (messageId: number, cfg?: RequestConfig) => {
        setState({ loading: true });
        const res = await withAuth(() => Api.deleteMessage(messageId, cfg));
        setState({ loading: false, error: pickError(res) });
        return res;
    }, []);
    return useMemo(() => ({ ...state, mutate }), [state, mutate]);
};

export const useGetMessage = () => {
    const [state, setState] = useState<State<MessageDTO>>({ loading: false });
    const refetch = useCallback(async (messageId: number, cfg?: RequestConfig) => {
        setState((s) => ({ ...s, loading: true }));
        const res = await withAuth(() => Api.getMessage(messageId, cfg));
        setState({ loading: false, data: res.data, error: pickError(res) });
        return res;
    }, []);
    return useMemo(() => ({ ...state, refetch }), [state, refetch]);
};

export const useGetChatInfo = () => {
    const [state, setState] = useState<State<ChatDTO>>({ loading: false });
    const refetch = useCallback(async (chatId: number, cfg?: RequestConfig) => {
        setState((s) => ({ ...s, loading: true }));
        const res = await withAuth(() => Api.getInfo(chatId, cfg));
        setState({ loading: false, data: res.data, error: pickError(res) });
        return res;
    }, []);
    return useMemo(() => ({ ...state, refetch }), [state, refetch]);
};

export const useGetChatMessages = () => {
    const [state, setState] = useState<State<CursorPageDTO<MessageDTO>>>({ loading: false });
    const refetch = useCallback(
        async (
            chatId: number,
            args?: { cursor?: number | null; take?: number },
            cfg?: RequestConfig
        ) => {
            setState((s) => ({ ...s, loading: true }));
            const res = await withAuth(() => Api.getMessages(chatId, args, cfg));
            setState({ loading: false, data: res.data, error: pickError(res) });
            return res;
        },
        []
    );
    return useMemo(() => ({ ...state, refetch }), [state, refetch]);
};

export const useAddUserToChat = () => {
    const [state, setState] = useState<State<void>>({ loading: false });
    const mutate = useCallback(async (chatId: number, userId: number, cfg?: RequestConfig) => {
        setState({ loading: true });
        const res = await withAuth(() => Api.addUser(chatId, userId, cfg));
        setState({ loading: false, error: pickError(res) });
        return res;
    }, []);
    return useMemo(() => ({ ...state, mutate }), [state, mutate]);
};

export const useLeaveChat = () => {
    const [state, setState] = useState<State<void>>({ loading: false });
    const mutate = useCallback(async (chatId: number, cfg?: RequestConfig) => {
        setState({ loading: true });
        const res = await withAuth(() => Api.leave(chatId, cfg));
        setState({ loading: false, error: pickError(res) });
        return res;
    }, []);
    return useMemo(() => ({ ...state, mutate }), [state, mutate]);
};

export const useRemoveUserFromChat = () => {
    const [state, setState] = useState<State<void>>({ loading: false });
    const mutate = useCallback(async (chatId: number, userId: number, cfg?: RequestConfig) => {
        setState({ loading: true });
        const res = await withAuth(() => Api.removeUser(chatId, userId, cfg));
        setState({ loading: false, error: pickError(res) });
        return res;
    }, []);
    return useMemo(() => ({ ...state, mutate }), [state, mutate]);
};

export const useUpdateChatCover = () => {
    const [state, setState] = useState<State<void>>({ loading: false });
    const mutate = useCallback(async (chatId: number, file: File, cfg?: RequestConfig) => {
        setState({ loading: true });
        const res = await withAuth(() => Api.updateCover(chatId, file, cfg));
        setState({ loading: false, error: pickError(res) });
        return res;
    }, []);
    return useMemo(() => ({ ...state, mutate }), [state, mutate]);
};

export const useUpdateChatName = () => {
    const [state, setState] = useState<State<void>>({ loading: false });
    const mutate = useCallback(async (chatId: number, newName: string, cfg?: RequestConfig) => {
        setState({ loading: true });
        const res = await withAuth(() => Api.updateName(chatId, newName, cfg));
        setState({ loading: false, error: pickError(res) });
        return res;
    }, []);
    return useMemo(() => ({ ...state, mutate }), [state, mutate]);
};

export const useReadMessages = () => {
    const [state, setState] = useState<State<void>>({ loading: false });
    const mutate = useCallback(async (chatId: number, messageIds: number[], cfg?: RequestConfig) => {
        setState({ loading: true });
        const res = await withAuth(() => Api.readMessages(chatId, messageIds, cfg));
        setState({ loading: false, error: pickError(res) });
        return res;
    }, []);
    return useMemo(() => ({ ...state, mutate }), [state, mutate]);
};

export const useReadAllMessages = () => {
    const [state, setState] = useState<State<void>>({ loading: false });
    const mutate = useCallback(async (chatId: number, cfg?: RequestConfig) => {
        setState({ loading: true });
        const res = await withAuth(() => Api.readAllMessages(chatId, cfg));
        setState({ loading: false, error: pickError(res) });
        return res;
    }, []);
    return useMemo(() => ({ ...state, mutate }), [state, mutate]);
};
