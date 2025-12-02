import type { Message } from '../types/Message';
import type { Chat } from '../types/Chat';
import type { User } from '@entities/User';

const currentUserId = 1;

const mockUsers = [
    { id: 1, userName: 'You', firstName: 'You', lastName: '' },
    { id: 2, userName: 'Moody', firstName: 'Moody', lastName: '' },
    { id: 3, userName: 'Alice', firstName: 'Alice', lastName: '' },
    { id: 4, userName: 'Bob', firstName: 'Bob', lastName: '' },
] as User[];

export const chatMockData: Record<number, { chat: Chat; messages: Message[] }> = {
    1: {
        chat: {
            id: 1,
            name: 'Moody',
            isGroup: false,
            coverId: 0,
        },
        messages: [
            {
                id: 1,
                textContent: 'Hello!',
                chatId: 1,
                senderId: 2,
                senderName: 'Moody',
                status: 'read',
                createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
            },
            {
                id: 2,
                textContent: 'Hi there! How are you?',
                chatId: 1,
                senderId: currentUserId,
                status: 'read',
                createdAt: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
            },
            {
                id: 3,
                textContent: 'I am doing great, thanks!',
                chatId: 1,
                senderId: 2,
                senderName: 'Moody',
                status: 'read',
                replyMessageId: 2,
                createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
                replyMessage: {
                    id: 2,
                    textContent: 'Hi there! How are you?',
                    chatId: 1,
                    senderId: currentUserId,
                    createdAt: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
                },
            },
        ],
    },
    2: {
        chat: {
            id: 2,
            name: 'Team Chat',
            isGroup: true,
            coverId: 0,
            users: [mockUsers[0], mockUsers[2], mockUsers[3]],
        },
        messages: [
            {
                id: 1,
                textContent: 'Hey everyone!',
                chatId: 2,
                senderId: 3,
                senderName: 'Alice',
                status: 'read',
                createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
            },
            {
                id: 2,
                textContent: 'Hi Alice! How is the project going?',
                chatId: 2,
                senderId: currentUserId,
                status: 'read',
                createdAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
            },
            {
                id: 3,
                textContent: 'Everything is on track! But Stas gandon',
                chatId: 2,
                senderId: 4,
                senderName: 'Bob',
                status: 'read',
                createdAt: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
            },
            {
                id: 4,
                textContent: 'Great to hear!',
                chatId: 2,
                senderId: currentUserId,
                status: 'read',
                createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
            },
            {
                id: 5,
                textContent: 'Meeting at 3 PM today',
                chatId: 2,
                senderId: 3,
                senderName: 'Alice',
                status: 'read',
                createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
            },
        ],
    },
};

export const getChatMockData = (chatId: number) => {
    return chatMockData[chatId] || null;
};

