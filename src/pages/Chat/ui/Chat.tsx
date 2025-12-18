import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Message } from '@widgets/Message';
import { SendInput } from '@widgets/SendInput';
import { ErrorIcon, Modal, Button, LoadingPlaceholder } from '@shared/ui';
import { DownArrow } from '@shared/ui/icons';
import type { Message as MessageType } from '@entities/Chat/model/types/Message';
import type { MessageDTO, MessageReadDTO } from '@entities/Chat/model/types';
import { 
    useGetChatMessagesQuery, 
    useSendMessageMutation,
    useDeleteMessageMutation,
    useEditMessageMutation,
    useReadAllMessagesMutation,
    chatApi
} from '@entities/Chat/api/rtkApi';
import { useSignalR, type MessageCreatedEvent, type MessageDeletedEvent, type MessageUpdatedEvent, type MessageReadEvent, type ChatNameUpdatedEvent, type ChatCoverUpdatedEvent, type ChatDeletedEvent } from '@shared/lib/signalr';
import { useAppDispatch, useAppSelector } from '@shared/store/hooks';
import { useCurrentUserId } from '@shared/lib/auth/useCurrentUserId';
import styles from './Chat.module.css';

export const Chat: React.FC = () => {
    const { chatId } = useParams<{ chatId: string }>();
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const messagesContainerRef = useRef<HTMLDivElement>(null);
    const [replyMessage, setReplyMessage] = useState<MessageType | null>(null);
    const [editingMessage, setEditingMessage] = useState<MessageType | null>(null);
    const [messageToDelete, setMessageToDelete] = useState<number | null>(null);
    const [isInitialLoad, setIsInitialLoad] = useState(true);
    const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
    const [allMessages, setAllMessages] = useState<MessageType[]>([]);
    const [oldestCursor, setOldestCursor] = useState<number | null>(null);
    const [isLoadingOlder, setIsLoadingOlder] = useState(false);
    const [showScrollToBottom, setShowScrollToBottom] = useState(false);
    const [hasReadAllMessages, setHasReadAllMessages] = useState(false);
    const scrollPositionRef = useRef<number>(0);
    const readMessagesTimeoutRef = useRef<number | null>(null);
    const isReadingMessagesRef = useRef(false); // Use ref to prevent multiple simultaneous calls
    const signalRReadAllDisabledRef = useRef(false); // Disable SignalR ReadAllMessages after first error
    
    const accessToken = useAppSelector((state) => state.auth.accessToken);
    const currentUserId = useCurrentUserId();

    const chatIdNumber = chatId ? Number(chatId) : 0;
    
    // Helper function to determine message status from ReadBy
    const getMessageStatus = useCallback((msg: MessageDTO, senderId?: number): MessageType['status'] => {
        // Only set status for own messages
        if (senderId !== currentUserId) {
            return undefined;
        }

        // If no ReadBy data, default to 'sent'
        if (!msg.readBy || msg.readBy.length === 0) {
            return 'sent';
        }

        // Find read record from recipient (not sender)
        const recipientRead = msg.readBy.find(read => read.userId !== currentUserId);
        
        if (!recipientRead) {
            // No read record from recipient yet
            return 'sent';
        }

        // If ReadAt is null, message is delivered but not read
        if (!recipientRead.readAt) {
            return 'delivered';
        }

        // If ReadAt is set, message is read
        return 'read';
    }, [currentUserId]);
    
    const { data: messagesData, isLoading: isLoadingMessages } = useGetChatMessagesQuery(
        { chatId: chatIdNumber, take: 50 },
        { skip: !chatIdNumber }
    );

    const { data: olderMessagesData, isLoading: isLoadingOlderMessages } = useGetChatMessagesQuery(
        { chatId: chatIdNumber, cursor: oldestCursor, take: 50 },
        { skip: !chatIdNumber || !oldestCursor || !isLoadingOlder }
    );
    
    const [sendMessage] = useSendMessageMutation();
    const [deleteMessage] = useDeleteMessageMutation();
    const [editMessage] = useEditMessageMutation();
    const { joinChat, leaveChat, setCallbacks, readAllMessages: readAllMessagesViaSignalR, isConnected: isSignalRConnected } = useSignalR();
    
    // Fallback to HTTP if SignalR is not connected
    const [readAllMessagesHttp] = useReadAllMessagesMutation();

    const [isChatJoined, setIsChatJoined] = useState(false);

    useEffect(() => {
        if (chatIdNumber) {
            joinChat(chatIdNumber)
                .then(() => {
                    setIsChatJoined(true);
                })
                .catch((error) => {
                    console.error('[Chat] Failed to join chat:', error);
                    setIsChatJoined(false);
                });
            return () => {
                leaveChat(chatIdNumber);
                setIsChatJoined(false);
            };
        }
    }, [chatIdNumber, joinChat, leaveChat]);

    // Update messages when new data arrives from API
    useEffect(() => {
        if (messagesData?.items && isInitialLoad) {
            const newMessages = messagesData.items.map((msg) => ({
                ...msg,
                id: msg.id!,
                chatId: chatIdNumber,
                status: getMessageStatus(msg, msg.senderId),
            })) as MessageType[];

            // First load - replace all messages
            setAllMessages(newMessages);
            
            // Set cursor using nextCursor/next/after from API response
            // API returns nextCursor as string, convert to number for next request
            const nextCursor = (messagesData as any).nextCursor || messagesData.next || messagesData.after;
            if (newMessages.length > 0 && nextCursor) {
                const cursorValue = typeof nextCursor === 'string' ? Number(nextCursor) : nextCursor;
                if (!isNaN(cursorValue)) {
                    setOldestCursor(cursorValue);
                    if (import.meta.env.DEV) {
                        console.log('[Chat] Initial load - set cursor from API:', cursorValue, 'nextCursor:', nextCursor);
                    }
                } else {
                    // Fallback: use oldest message ID
                    const oldestMessage = newMessages.reduce((oldest, current) => {
                        const oldestTime = oldest.createdAt ? new Date(oldest.createdAt).getTime() : Infinity;
                        const currentTime = current.createdAt ? new Date(current.createdAt).getTime() : Infinity;
                        return currentTime < oldestTime ? current : oldest;
                    });
                    setOldestCursor(oldestMessage.id);
                    if (import.meta.env.DEV) {
                        console.log('[Chat] Initial load - set cursor from oldest message:', oldestMessage.id);
                    }
                }
            } else {
                setOldestCursor(null);
                if (import.meta.env.DEV) {
                    console.log('[Chat] Initial load - no more messages, cursor set to null');
                }
            }
        }
    }, [messagesData, chatIdNumber, isInitialLoad, currentUserId, getMessageStatus]);

    // Handle loading older messages
    useEffect(() => {
        if (olderMessagesData?.items && isLoadingOlder) {
            const olderMessages = olderMessagesData.items.map((msg) => ({
                ...msg,
                id: msg.id!,
                chatId: chatIdNumber,
                status: getMessageStatus(msg, msg.senderId),
            })) as MessageType[];

            setAllMessages((prev) => {
                const existingIds = new Set(prev.map(m => m.id));
                const uniqueOlder = olderMessages.filter(m => !existingIds.has(m.id));
                
                // Old messages should be added before existing messages (they are older)
                // Sort all messages by createdAt ascending (oldest first)
                const combined = [...uniqueOlder, ...prev].sort((a, b) => {
                    const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
                    const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
                    return timeA - timeB;
                });

                // Update cursor using nextCursor/next/after from API response
                const nextCursor = (olderMessagesData as any).nextCursor || olderMessagesData.next || olderMessagesData.after;
                if (nextCursor) {
                    const cursorValue = typeof nextCursor === 'string' ? Number(nextCursor) : nextCursor;
                    if (!isNaN(cursorValue)) {
                        setOldestCursor(cursorValue);
                        if (import.meta.env.DEV) {
                            console.log('[Chat] Loaded older messages - set cursor from API:', cursorValue);
                        }
                    } else {
                        // Fallback: use oldest message ID from new batch
                        if (uniqueOlder.length > 0) {
                            const oldestFromNewBatch = uniqueOlder.reduce((oldest, current) => {
                                const oldestTime = oldest.createdAt ? new Date(oldest.createdAt).getTime() : Infinity;
                                const currentTime = current.createdAt ? new Date(current.createdAt).getTime() : Infinity;
                                return currentTime < oldestTime ? current : oldest;
                            });
                            setOldestCursor(oldestFromNewBatch.id);
                        }
                    }
                } else {
                    setOldestCursor(null);
                    if (import.meta.env.DEV) {
                        console.log('[Chat] Loaded older messages - no more messages, cursor set to null');
                    }
                }

                // Restore scroll position after loading older messages
                setTimeout(() => {
                    if (messagesContainerRef.current) {
                        const newScrollHeight = messagesContainerRef.current.scrollHeight;
                        const scrollDiff = newScrollHeight - scrollPositionRef.current;
                        messagesContainerRef.current.scrollTop = scrollDiff;
                    }
                }, 0);

                return combined;
            });
            
            setIsLoadingOlder(false);
        }
    }, [olderMessagesData, chatIdNumber, isLoadingOlder, currentUserId, getMessageStatus]);

    // Reset loading state if query fails or completes
    useEffect(() => {
        if (!isLoadingOlderMessages && isLoadingOlder && !olderMessagesData) {
            setIsLoadingOlder(false);
        }
    }, [isLoadingOlderMessages, isLoadingOlder, olderMessagesData]);

    // Handle SignalR events - add new messages directly without refetch
    useEffect(() => {
        setCallbacks({
            onMessageCreated: (event: MessageCreatedEvent) => {
                if (event.chatId === chatIdNumber) {
                    // Add new message directly to state
                    const newMessage: MessageType = {
                        id: event.id,
                        textContent: event.textContent,
                        replyMessageId: event.replyMessageId || undefined,
                        chatId: event.chatId,
                        senderId: event.senderId,
                        createdAt: event.createdAtUtc,
                        readBy: event.senderId === currentUserId 
                            ? [] // Empty ReadBy for own messages initially
                            : undefined,
                        status: event.senderId === currentUserId ? ('sent' as const) : undefined,
                    } as MessageType;

                    setAllMessages((prev) => {
                        const exists = prev.some(m => m.id === event.id);
                        if (exists) return prev;
                        return [...prev, newMessage].sort((a, b) => {
                            const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
                            const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
                            return timeA - timeB;
                        });
                    });

                    // If new message is from another user and we're at bottom, mark as read
                    if (event.senderId !== currentUserId) {
                        // Reset hasReadAllMessages to allow marking new messages as read
                        setHasReadAllMessages(false);
                    }

                    // Invalidate only chat list to update last message, not messages
                    dispatch(
                        chatApi.util.invalidateTags([
                            { type: 'Chat', id: 'LIST' },
                        ])
                    );
                }
            },
            onMessageDeleted: (event: MessageDeletedEvent) => {
                if (event.chatId === chatIdNumber) {
                    setAllMessages((prev) => prev.filter(m => m.id !== event.messageId));
                }
            },
            onMessageUpdated: (event: MessageUpdatedEvent) => {
                if (event.chatId === chatIdNumber) {
                    setAllMessages((prev) =>
                        prev.map((msg) =>
                            msg.id === event.messageId
                                ? { ...msg, textContent: event.textContent }
                                : msg
                        )
                    );
                    // Cancel editing if the message being edited was updated
                    if (editingMessage?.id === event.messageId) {
                        setEditingMessage(null);
                    }
                }
            },
            onMessageRead: (event: MessageReadEvent) => {
                // Update read status in local state via SignalR event
                if (event.chatId === chatIdNumber) {
                    setAllMessages((prev) =>
                        prev.map((msg) => {
                            if (!event.messageIds.includes(msg.id)) {
                                return msg;
                            }

                            // Update ReadBy array for all messages (not just own)
                            const existingReadBy = msg.readBy || [];
                            const readByIndex = existingReadBy.findIndex((r: MessageReadDTO) => r.userId === event.userId);
                            
                            const updatedReadBy = readByIndex >= 0
                                ? existingReadBy.map((r: MessageReadDTO, idx: number) => 
                                    idx === readByIndex 
                                        ? { ...r, readAt: event.readAtUtc }
                                        : r
                                )
                                : [...existingReadBy, {
                                    messageId: msg.id,
                                    userId: event.userId,
                                    readAt: event.readAtUtc,
                                }];

                            // If this is our own message, update status based on ReadBy
                            if (msg.senderId === currentUserId) {
                                const updatedMsg = {
                                    ...msg,
                                    readBy: updatedReadBy,
                                };
                                return {
                                    ...updatedMsg,
                                    status: getMessageStatus(updatedMsg, msg.senderId),
                                };
                            }

                            // For messages from others, just update ReadBy
                            return {
                                ...msg,
                                readBy: updatedReadBy,
                            };
                        })
                    );
                }
            },
            onChatNameUpdated: (event: ChatNameUpdatedEvent) => {
                if (event.chatId === chatIdNumber) {
                    // Invalidate only chat list for header update (name is in list)
                    dispatch(
                        chatApi.util.invalidateTags([
                            { type: 'Chat', id: 'LIST' },
                        ])
                    );
                }
            },
            onChatCoverUpdated: (event: ChatCoverUpdatedEvent) => {
                if (event.chatId === chatIdNumber) {
                    // Invalidate only chat list for header update (cover is in list)
                    dispatch(
                        chatApi.util.invalidateTags([
                            { type: 'Chat', id: 'LIST' },
                        ])
                    );
                }
            },
            onChatDeleted: (event: ChatDeletedEvent) => {
                if (event.chatId === chatIdNumber) {
                    // Navigate to chats list if current chat was deleted
                    navigate('/chats');
                    // Invalidate chat list and current chat
                    dispatch(
                        chatApi.util.invalidateTags([
                            { type: 'Chat', id: 'LIST' },
                            { type: 'Chat', id: event.chatId },
                        ])
                    );
                }
            },
        });
    }, [chatIdNumber, dispatch, setCallbacks, currentUserId, getMessageStatus, editingMessage, navigate]);

    // Determine if there are more messages to load
    const hasMoreMessages = useMemo(() => {
        // Must have a cursor to load more
        if (oldestCursor === null) {
            return false;
        }
        // Check if API explicitly says no more messages
        if (messagesData?.hasMore === false) {
            return false;
        }
        // If we have messages and a cursor, there are likely more
        return allMessages.length > 0;
    }, [oldestCursor, messagesData?.hasMore, allMessages.length]);
    const isGroupChat = false; // Will be determined from message context if needed

    // Process messages to add replyMessage objects
    const messages = React.useMemo(() => {
        if (!allMessages.length) return [];
        
        const messagesMap = new Map(allMessages.map(msg => [msg.id, msg]));
        
        return allMessages.map((message) => {
            const processedMessage: MessageType = {
                ...message,
                senderName: undefined,
            };
            
            if (message.replyMessageId) {
                const replyMsg = messagesMap.get(message.replyMessageId);
                if (replyMsg) {
                    processedMessage.replyMessage = {
                        ...replyMsg,
                        chatId: chatIdNumber,
                    } as MessageType;
                }
            }
            
            return processedMessage;
        });
    }, [allMessages, chatIdNumber]);

    // Check if user is near bottom of scroll
    const checkIfNearBottom = useCallback((): boolean => {
        if (!messagesContainerRef.current) return false;
        const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
        const threshold = 100; // pixels from bottom
        return scrollHeight - scrollTop - clientHeight < threshold;
    }, []);

    // Handle scroll events to detect if user scrolled up and load older messages
    useEffect(() => {
        const container = messagesContainerRef.current;
        if (!container) return;

        const handleScroll = () => {
            const isNearBottom = checkIfNearBottom();
            setShouldAutoScroll(isNearBottom);

            // Show/hide scroll to bottom button
            const { scrollTop, scrollHeight, clientHeight } = container;
            const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
            setShowScrollToBottom(distanceFromBottom > 300); // Show button if more than 300px from bottom

            if (isNearBottom && !hasReadAllMessages && !isReadingMessagesRef.current && chatIdNumber) {
                if (readMessagesTimeoutRef.current) {
                    clearTimeout(readMessagesTimeoutRef.current);
                }
                
                readMessagesTimeoutRef.current = setTimeout(() => {
                    if (!isReadingMessagesRef.current && !hasReadAllMessages && chatIdNumber) {
                        isReadingMessagesRef.current = true;
                        setHasReadAllMessages(true);
                        
                        const markAsRead = () => {
                            if (isSignalRConnected && isChatJoined && !signalRReadAllDisabledRef.current) {
                                return readAllMessagesViaSignalR(chatIdNumber).catch((error) => {
                                    signalRReadAllDisabledRef.current = true;
                                    console.error('Failed to mark all messages as read via SignalR, falling back to HTTP:', error);
                                    return readAllMessagesHttp(chatIdNumber);
                                });
                            } else {
                                return readAllMessagesHttp(chatIdNumber);
                            }
                        };
                        
                        markAsRead()
                            .catch((error) => {
                                console.error('Failed to mark all messages as read:', error);
                            })
                            .finally(() => {
                                isReadingMessagesRef.current = false;
                            });
                    }
                }, 5000);
            }

            // Load older messages when scrolling to top (within 100px from top)
            const threshold = 100;
            const canLoad = (
                scrollTop <= threshold && 
                hasMoreMessages && 
                !isLoadingOlder && 
                !isLoadingMessages && 
                oldestCursor !== null
            );
            
            if (canLoad) {
                if (import.meta.env.DEV) {
                    console.log('[Chat] Loading older messages:', {
                        scrollTop,
                        hasMoreMessages,
                        isLoadingOlder,
                        isLoadingMessages,
                        oldestCursor,
                    });
                }
                scrollPositionRef.current = container.scrollHeight;
                setIsLoadingOlder(true);
            }
        };

        container.addEventListener('scroll', handleScroll, { passive: true });
        return () => {
            container.removeEventListener('scroll', handleScroll);
            if (readMessagesTimeoutRef.current) {
                clearTimeout(readMessagesTimeoutRef.current);
            }
        };
    }, [hasMoreMessages, isLoadingOlder, isLoadingMessages, oldestCursor, checkIfNearBottom, hasReadAllMessages, chatIdNumber, readAllMessagesViaSignalR, isSignalRConnected, readAllMessagesHttp, isChatJoined]);

    // Scroll to bottom on initial load or when new messages arrive (only if user is at bottom)
    useEffect(() => {
        if (isInitialLoad && messages.length > 0 && messagesContainerRef.current) {
            // Scroll to bottom immediately on first load
            setTimeout(() => {
                if (messagesContainerRef.current) {
                    messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
                    if (chatIdNumber && isChatJoined && !hasReadAllMessages && !isReadingMessagesRef.current) {
                        isReadingMessagesRef.current = true;
                        setHasReadAllMessages(true);
                        
                        const markAsRead = () => {
                            if (isSignalRConnected && isChatJoined && !signalRReadAllDisabledRef.current) {
                                return readAllMessagesViaSignalR(chatIdNumber).catch((error) => {
                                    signalRReadAllDisabledRef.current = true;
                                    console.error('Failed to mark all messages as read via SignalR on initial load, falling back to HTTP:', error);
                                    return readAllMessagesHttp(chatIdNumber);
                                });
                            } else {
                                return readAllMessagesHttp(chatIdNumber);
                            }
                        };
                        
                        markAsRead()
                            .catch((error) => {
                                console.error('Failed to mark all messages as read on initial load:', error);
                            })
                            .finally(() => {
                                isReadingMessagesRef.current = false;
                            });
                    }
                }
            }, 100); // Small delay to ensure scroll is complete
            setIsInitialLoad(false);
            setShouldAutoScroll(true);
        } else if (!isInitialLoad && messages.length > 0 && shouldAutoScroll) {
            // Smooth scroll for new messages only if user is at bottom
            setTimeout(() => {
                messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
                if (chatIdNumber && isChatJoined && !hasReadAllMessages && !isReadingMessagesRef.current && checkIfNearBottom()) {
                    isReadingMessagesRef.current = true;
                    setHasReadAllMessages(true);
                    
                    const markAsRead = () => {
                        if (isSignalRConnected && isChatJoined && !signalRReadAllDisabledRef.current) {
                            return readAllMessagesViaSignalR(chatIdNumber).catch((error) => {
                                signalRReadAllDisabledRef.current = true;
                                console.error('Failed to mark all messages as read via SignalR on new message, falling back to HTTP:', error);
                                return readAllMessagesHttp(chatIdNumber);
                            });
                        } else {
                            return readAllMessagesHttp(chatIdNumber);
                        }
                    };
                    
                    markAsRead()
                        .catch((error) => {
                            console.error('Failed to mark all messages as read on new message:', error);
                        })
                        .finally(() => {
                            isReadingMessagesRef.current = false;
                        });
                }
            }, 100);
        }
    }, [messages, isInitialLoad, shouldAutoScroll, chatIdNumber, isChatJoined, hasReadAllMessages, isSignalRConnected, readAllMessagesViaSignalR, readAllMessagesHttp, checkIfNearBottom]);

    useEffect(() => {
        setIsInitialLoad(true);
        setShouldAutoScroll(true);
        setAllMessages([]);
        setOldestCursor(null);
        setIsLoadingOlder(false);
        setShowScrollToBottom(false);
        setHasReadAllMessages(false);
        setIsChatJoined(false);
        isReadingMessagesRef.current = false;
        signalRReadAllDisabledRef.current = false;
        if (readMessagesTimeoutRef.current) {
            clearTimeout(readMessagesTimeoutRef.current);
            readMessagesTimeoutRef.current = null;
        }
    }, [chatIdNumber]);

    // Periodically check if user is at bottom and mark messages as read
    // DISABLED: Causing too many requests
    // useEffect(() => {
    //     if (!chatIdNumber || !isChatJoined || hasReadAllMessages || isReadingMessagesRef.current) return;

    //     const interval = setInterval(() => {
    //         if (checkIfNearBottom() && messages.length > 0 && !isReadingMessagesRef.current && !hasReadAllMessages) {
    //             isReadingMessagesRef.current = true;
    //             setHasReadAllMessages(true);
                
    //             const markAsRead = () => {
    //                 if (isSignalRConnected && !signalRReadAllDisabledRef.current) {
    //                     return readAllMessagesViaSignalR(chatIdNumber).catch((error) => {
    //                         signalRReadAllDisabledRef.current = true;
    //                         console.error('Failed to mark all messages as read via SignalR (periodic check), falling back to HTTP:', error);
    //                         return readAllMessagesHttp(chatIdNumber);
    //                     });
    //                 } else {
    //                     return readAllMessagesHttp(chatIdNumber);
    //                 }
    //             };
                
    //             markAsRead()
    //                 .catch((error) => {
    //                     console.error('Failed to mark all messages as read (periodic check):', error);
    //                 })
    //                 .finally(() => {
    //                     isReadingMessagesRef.current = false;
    //                 });
    //         }
    //     }, 30000); // Check every 30 seconds (disabled for now)

    //     return () => clearInterval(interval);
    // }, [chatIdNumber, isChatJoined, hasReadAllMessages, checkIfNearBottom, messages.length, isSignalRConnected, readAllMessagesViaSignalR, readAllMessagesHttp]);

    const handleScrollToBottom = useCallback(() => {
        if (messagesContainerRef.current) {
            messagesContainerRef.current.scrollTo({
                top: messagesContainerRef.current.scrollHeight,
                behavior: 'smooth',
            });
            setShouldAutoScroll(true);
            if (!hasReadAllMessages && !isReadingMessagesRef.current && chatIdNumber) {
                isReadingMessagesRef.current = true;
                setHasReadAllMessages(true);
                
                const markAsRead = () => {
                    if (isSignalRConnected && isChatJoined && !signalRReadAllDisabledRef.current) {
                        return readAllMessagesViaSignalR(chatIdNumber).catch((error) => {
                            signalRReadAllDisabledRef.current = true;
                            console.error('Failed to mark all messages as read via SignalR, falling back to HTTP:', error);
                            return readAllMessagesHttp(chatIdNumber);
                        });
                    } else {
                        return readAllMessagesHttp(chatIdNumber);
                    }
                };
                
                markAsRead()
                    .catch((error) => {
                        console.error('Failed to mark all messages as read:', error);
                    })
                    .finally(() => {
                        isReadingMessagesRef.current = false;
                    });
            }
        }
    }, [hasReadAllMessages, chatIdNumber, readAllMessagesViaSignalR, isSignalRConnected, readAllMessagesHttp, isChatJoined]);

    const handleSend = async (text: string) => {
        if (!chatIdNumber || !text.trim()) return;
        
        try {
            if (editingMessage) {
                // Edit existing message
                await editMessage({
                    messageId: editingMessage.id,
                    textContent: text,
                }).unwrap();
                setEditingMessage(null);
            } else {
                // Send new message
                await sendMessage({
                    chatId: chatIdNumber,
                    message: {
                        textContent: text,
                        replyMessageId: replyMessage?.id,
                    },
                }).unwrap();
                setReplyMessage(null);
            }
        } catch (error) {
            console.error('Failed to send/edit message:', error);
        }
    };

    const handleReply = (messageId: number) => {
        const message = messages.find(m => m.id === messageId);
        if (message) {
            setReplyMessage(message);
        }
    };

    const handleCancelReply = () => {
        setReplyMessage(null);
    };

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
    };

    const handleEdit = (messageId: number) => {
        const message = messages.find(m => m.id === messageId);
        if (message) {
            setEditingMessage(message);
            setReplyMessage(null); // Cancel reply if editing
        }
    };

    const handleDelete = (messageId: number) => {
        setMessageToDelete(messageId);
    };

    const handleConfirmDelete = async () => {
        if (!messageToDelete) return;
        
        try {
            await deleteMessage(messageToDelete).unwrap();
            setMessageToDelete(null);
        } catch (error) {
            console.error('Failed to delete message:', error);
        }
    };

    const handleCancelDelete = () => {
        setMessageToDelete(null);
    };

    const handleCancelEdit = () => {
        setEditingMessage(null);
    };

    const handleReport = (messageId: number) => {
        navigate(`/report?messageId=${messageId}`);
    };

    const handleAttach = () => {
        // TODO: Implement file attachment functionality
    };

    if (isLoadingMessages) {
        return (
            <div className={styles.container}>
                <div className={styles.emptyState}>
                    <LoadingPlaceholder variant="spinner" text="Loading chat..." />
                </div>
            </div>
        );
    }

    if (currentUserId === null) {
        return (
            <div className={styles.container}>
                <div className={styles.emptyState}>
                    <div className={styles.errorIcon}>
                        <ErrorIcon />
                    </div>
                    <h2 className={styles.emptyTitle}>Authentication error</h2>
                    <p className={styles.emptyText}>Unable to identify current user. Please try logging in again.</p>
                </div>
            </div>
        );
    }

    const isBeginningOfConversation = allMessages.length > 0 && oldestCursor === null && !isLoadingMessages;

    return (
        <div className={styles.container}>
            {showScrollToBottom && (
                <button 
                    className={styles.scrollToBottomButton}
                    onClick={handleScrollToBottom}
                    aria-label="Scroll to bottom"
                >
                    <DownArrow className={styles.scrollToBottomIcon} />
                </button>
            )}
            <div className={styles.messages} ref={messagesContainerRef}>
                {isBeginningOfConversation && (
                    <div className={styles.beginningIndicator}>
                        <span>This is the beginning of the conversation</span>
                    </div>
                )}
                {hasMoreMessages && !isBeginningOfConversation && (
                    <div className={styles.moreMessagesIndicator}>
                        <span>More messages above</span>
                    </div>
                )}
                {messages.map((message) => (
                    <Message
                        key={message.id}
                        message={message}
                        isOwn={message.senderId === currentUserId}
                        currentUserId={currentUserId}
                        senderName={message.senderId !== currentUserId && isGroupChat ? undefined : undefined}
                        senderAvatar={undefined}
                        isGroupChat={isGroupChat}
                        onReply={handleReply}
                        onCopy={handleCopy}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        onReport={handleReport}
                    />
                ))}
                <div ref={messagesEndRef} />
            </div>
            <SendInput 
                onSend={handleSend} 
                onAttach={handleAttach}
                replyMessage={replyMessage}
                onCancelReply={handleCancelReply}
                editingMessage={editingMessage}
                onCancelEdit={handleCancelEdit}
            />
            <Modal
                isOpen={messageToDelete !== null}
                onClose={handleCancelDelete}
                title="Delete Message"
                closeOnBackdropClick={true}
            >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
                    <p style={{ color: '#EAEAEA', textAlign: 'center', margin: 0 }}>
                        Are you sure you want to delete this message? This action cannot be undone.
                    </p>
                    <div style={{ display: 'flex', gap: '12px', width: '100%' }}>
                        <Button
                            variant="filled"
                            theme="dark"
                            size="large"
                            shape="cr-16"
                            fullWidth
                            onClick={handleCancelDelete}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="filled"
                            theme="light"
                            size="large"
                            shape="cr-16"
                            fullWidth
                            onClick={handleConfirmDelete}
                        >
                            Delete
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

