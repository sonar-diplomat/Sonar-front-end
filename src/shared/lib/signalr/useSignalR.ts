import { useEffect, useRef, useCallback, useState } from 'react';
import { signalRManager } from './signalr-manager';
import { authManager } from '../auth/auth-manager';
import { HubConnectionState } from '@microsoft/signalr';

/**
 * SignalR event interfaces
 */
export interface MessageCreatedEvent {
  id: number;
  chatId: number;
  senderId: number;
  textContent: string;
  replyMessageId: number | null;
  createdAtUtc: string;
}

export interface MessageReadEvent {
  chatId: number;
  userId: number;
  messageIds: number[];
  readAtUtc: string;
}

export interface MessageDeletedEvent {
  chatId: number;
  messageId: number;
  initiatorId: number;
}

export interface ChatNameUpdatedEvent {
  chatId: number;
  name: string;
}

export interface ChatCoverUpdatedEvent {
  chatId: number;
  coverId: number;
}

export interface ChatUserAddedEvent {
  chatId: number;
  userId: number;
}

export interface ChatUserRemovedEvent {
  chatId: number;
  userId: number;
}

export interface TypingEvent {
  chatId: number;
  userId: number;
}

/**
 * Hook for working with SignalR
 */
export const useSignalR = () => {
  const callbacksRef = useRef<{
    onMessageCreated?: (event: MessageCreatedEvent) => void;
    onMessageRead?: (event: MessageReadEvent) => void;
    onMessageDeleted?: (event: MessageDeletedEvent) => void;
    onChatNameUpdated?: (event: ChatNameUpdatedEvent) => void;
    onChatCoverUpdated?: (event: ChatCoverUpdatedEvent) => void;
    onChatUserAdded?: (event: ChatUserAddedEvent) => void;
    onChatUserRemoved?: (event: ChatUserRemovedEvent) => void;
    onTyping?: (event: TypingEvent) => void;
  }>({});
  const [connectionState, setConnectionState] = useState<HubConnectionState>(
    signalRManager.getConnectionState()
  );

  useEffect(() => {
    const updateConnectionState = () => {
      setConnectionState(signalRManager.getConnectionState());
    };

    const interval = setInterval(updateConnectionState, 1000);

    if (authManager.isAuthenticated()) {
      signalRManager.connect()
        .then(() => {
          updateConnectionState();
        })
        .catch((error) => {
          console.error('[useSignalR] Failed to connect:', error);
          updateConnectionState();
        });
    }

    return () => {
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    const messageCreatedWrapper = (event: MessageCreatedEvent) => {
      if (callbacksRef.current.onMessageCreated) {
        callbacksRef.current.onMessageCreated(event);
      }
    };
    const messageReadWrapper = (event: MessageReadEvent) => {
      if (callbacksRef.current.onMessageRead) {
        callbacksRef.current.onMessageRead(event);
      }
    };
    const messageDeletedWrapper = (event: MessageDeletedEvent) => {
      if (callbacksRef.current.onMessageDeleted) {
        callbacksRef.current.onMessageDeleted(event);
      }
    };
    const chatNameUpdatedWrapper = (event: ChatNameUpdatedEvent) => {
      if (callbacksRef.current.onChatNameUpdated) {
        callbacksRef.current.onChatNameUpdated(event);
      }
    };
    const chatCoverUpdatedWrapper = (event: ChatCoverUpdatedEvent) => {
      if (callbacksRef.current.onChatCoverUpdated) {
        callbacksRef.current.onChatCoverUpdated(event);
      }
    };
    const chatUserAddedWrapper = (event: ChatUserAddedEvent) => {
      if (callbacksRef.current.onChatUserAdded) {
        callbacksRef.current.onChatUserAdded(event);
      }
    };
    const chatUserRemovedWrapper = (event: ChatUserRemovedEvent) => {
      if (callbacksRef.current.onChatUserRemoved) {
        callbacksRef.current.onChatUserRemoved(event);
      }
    };
    const typingWrapper = (event: TypingEvent) => {
      if (callbacksRef.current.onTyping) {
        callbacksRef.current.onTyping(event);
      }
    };

    // Подписываемся на события
    signalRManager.on<MessageCreatedEvent>('message.created', messageCreatedWrapper);
    signalRManager.on<MessageReadEvent>('message.read', messageReadWrapper);
    signalRManager.on<MessageDeletedEvent>('message.deleted', messageDeletedWrapper);
    signalRManager.on<ChatNameUpdatedEvent>('chat.name.updated', chatNameUpdatedWrapper);
    signalRManager.on<ChatCoverUpdatedEvent>('chat.cover.updated', chatCoverUpdatedWrapper);
    signalRManager.on<ChatUserAddedEvent>('chat.user.added', chatUserAddedWrapper);
    signalRManager.on<ChatUserRemovedEvent>('chat.user.removed', chatUserRemovedWrapper);
    signalRManager.on<TypingEvent>('Typing', typingWrapper);

    return () => {
      signalRManager.off('message.created', messageCreatedWrapper);
      signalRManager.off('message.read', messageReadWrapper);
      signalRManager.off('message.deleted', messageDeletedWrapper);
      signalRManager.off('chat.name.updated', chatNameUpdatedWrapper);
      signalRManager.off('chat.cover.updated', chatCoverUpdatedWrapper);
      signalRManager.off('chat.user.added', chatUserAddedWrapper);
      signalRManager.off('chat.user.removed', chatUserRemovedWrapper);
      signalRManager.off('Typing', typingWrapper);
    };
  }, []);

  const joinChat = useCallback(async (chatId: number) => {
    try {
      await signalRManager.joinChat(chatId);
    } catch (error) {
      console.error(`[useSignalR] Failed to join chat ${chatId}:`, error);
    }
  }, []);

  const leaveChat = useCallback(async (chatId: number) => {
    try {
      await signalRManager.leaveChat(chatId);
    } catch (error) {
      console.error(`[useSignalR] Failed to leave chat ${chatId}:`, error);
    }
  }, []);

  const sendTyping = useCallback(async (chatId: number) => {
    try {
      await signalRManager.sendTyping(chatId);
    } catch (error) {
      console.error(`[useSignalR] Failed to send typing event for chat ${chatId}:`, error);
    }
  }, []);

  const readMessages = useCallback(async (chatId: number, messageIds: number[]) => {
    try {
      await signalRManager.readMessages(chatId, messageIds);
    } catch (error) {
      console.error(`[useSignalR] Failed to read messages for chat ${chatId}:`, error);
      throw error;
    }
  }, []);

  const readAllMessages = useCallback(async (chatId: number) => {
    try {
      await signalRManager.readAllMessages(chatId);
    } catch (error) {
      console.error(`[useSignalR] Failed to read all messages for chat ${chatId}:`, error);
      throw error;
    }
  }, []);

  const setCallbacks = useCallback((callbacks: typeof callbacksRef.current) => {
    callbacksRef.current = callbacks;
  }, []);

  return {
    joinChat,
    leaveChat,
    sendTyping,
    readMessages,
    readAllMessages,
    setCallbacks,
    isConnected: connectionState === HubConnectionState.Connected,
    connectionState,
  };
};

