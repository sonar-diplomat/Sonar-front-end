import assert from 'node:assert/strict';
import test from 'node:test';

import rawSeed from '../../../demo/data/seed.json' with { type: 'json' };
import { createGroupChatWithMembers } from '../../entities/Chat/model/createGroupChat.ts';
import type { ChatListItemDTO, CreateChatDTO } from '../../entities/Chat/model/types.ts';

import type { DemoSeed, MockRequest } from './database.ts';
import { createMockTransport } from './transport.ts';

const dto: CreateChatDTO = { name: 'Same group name', isGroup: true, coverId: 1 };
const creatorId = rawSeed.currentUserId;

function setup() {
    const transport = createMockTransport({ seed: rawSeed as DemoSeed });
    async function request<T>(args: MockRequest): Promise<T> {
        const result = await transport.dispatch(args);
        assert.equal(result.success, true, result.message);
        return result.data as T;
    }
    const operations = {
        getChats: () => request<ChatListItemDTO[]>({ url: 'Chat' }),
        createChat: async (body: CreateChatDTO) => {
            const result = await transport.dispatch({ url: 'Chat', method: 'POST', body });
            assert.equal(result.success, true, result.message);
            assert.equal('data' in result, false, 'POST Chat must match the server success-only response');
        },
        addUserToChat: async ({ chatId, userId }: { chatId: number; userId: number }) => {
            await request({ url: `Chat/${chatId}/add/${userId}`, method: 'POST' });
        },
    };
    return { transport, operations };
}

test('same-name groups keep separate IDs and member lists', async () => {
    const { transport, operations } = setup();
    const firstId = await createGroupChatWithMembers(dto, creatorId, [2], operations);
    const firstBefore = transport.getSnapshot().chats.find(chat => chat.id === firstId);
    const secondId = await createGroupChatWithMembers(dto, creatorId, [3, 4], operations);
    assert.notEqual(secondId, firstId);
    const chats = transport.getSnapshot().chats;
    assert.deepEqual(chats.find(chat => chat.id === firstId), firstBefore);
    assert.deepEqual(chats.find(chat => chat.id === secondId)?.userIds, [creatorId, 3, 4]);
});

test('a failed initial snapshot prevents creation and all member changes', async () => {
    const { transport, operations } = setup();
    const before = transport.getSnapshot();
    await assert.rejects(createGroupChatWithMembers(dto, creatorId, [2], {
        ...operations,
        getChats: async () => { throw new Error('List unavailable'); },
    }), /List unavailable/);
    assert.deepEqual(transport.getSnapshot(), before);
});

test('a failed POST prevents member changes and the second list request', async () => {
    const { transport, operations } = setup();
    const before = transport.getSnapshot();
    let reads = 0;
    await assert.rejects(createGroupChatWithMembers(dto, creatorId, [2], {
        ...operations,
        getChats: async () => { reads++; return operations.getChats(); },
        createChat: async () => { throw new Error('Create failed'); },
    }), /Create failed/);
    assert.equal(reads, 1);
    assert.deepEqual(transport.getSnapshot(), before);
});

test('a failed list after creation cannot fall back to cached same-name groups', async () => {
    const { transport, operations } = setup();
    const oldId = await createGroupChatWithMembers(dto, creatorId, [2], operations);
    const before = transport.getSnapshot();
    let reads = 0;
    await assert.rejects(createGroupChatWithMembers(dto, creatorId, [3], {
        ...operations,
        getChats: async () => {
            if (++reads === 2) throw new Error('List unavailable');
            return operations.getChats();
        },
    }), /ID could not be verified/);
    const after = transport.getSnapshot();
    assert.deepEqual(after.chats.find(chat => chat.id === oldId), before.chats.find(chat => chat.id === oldId));
    assert.deepEqual(after.chats.at(-1)?.userIds, [creatorId]);
});

test('no new ID is an error even when an old group matches every creation field', async () => {
    const { transport, operations } = setup();
    await createGroupChatWithMembers(dto, creatorId, [2], operations);
    const before = transport.getSnapshot();
    const staleChats = await operations.getChats();
    await assert.rejects(createGroupChatWithMembers(dto, creatorId, [3], {
        ...operations,
        getChats: async () => staleChats,
    }), /could not be identified uniquely/);
    const after = transport.getSnapshot();
    assert.deepEqual(after.chats.slice(0, -1), before.chats);
    assert.deepEqual(after.chats.at(-1)?.userIds, [creatorId]);
});

test('concurrent new group IDs are ambiguous regardless of name or list order', async () => {
    for (const name of [dto.name, 'Another group']) {
        const { transport, operations } = setup();
        const before = transport.getSnapshot();
        await assert.rejects(createGroupChatWithMembers(dto, creatorId, [3], {
            ...operations,
            createChat: async body => {
                await operations.createChat(body);
                await operations.createChat({ ...body, name });
            },
            getChats: async () => (await operations.getChats()).reverse(),
        }), /could not be identified uniquely/);
        const after = transport.getSnapshot();
        assert.deepEqual(after.chats.slice(0, -2), before.chats);
        assert.deepEqual(after.chats.slice(-2).map(chat => chat.userIds), [[creatorId], [creatorId]]);
    }
});

test('unexpected new group metadata or invalid IDs never receive selected members', async () => {
    for (const change of [{ name: 'Unexpected group' }, { coverId: 999 }, { id: 0 }, { id: 1.5 }]) {
        const { operations } = setup();
        let reads = 0;
        let adds = 0;
        await assert.rejects(createGroupChatWithMembers(dto, creatorId, [3], {
            ...operations,
            getChats: async () => {
                const chats = await operations.getChats();
                return ++reads === 2 ? chats.map((chat, index) => index === chats.length - 1 ? { ...chat, ...change } : chat) : chats;
            },
            addUserToChat: async () => { adds++; },
        }), /could not be identified uniquely/);
        assert.equal(adds, 0);
    }
});

test('member-add failure rejects completion and stops subsequent adds', async () => {
    const { transport, operations } = setup();
    const oldId = await createGroupChatWithMembers(dto, creatorId, [5], operations);
    const oldChat = transport.getSnapshot().chats.find(chat => chat.id === oldId);
    const added: number[] = [];
    await assert.rejects(createGroupChatWithMembers(dto, creatorId, [2, 3, 4], {
        ...operations,
        addUserToChat: async args => {
            added.push(args.userId);
            if (args.userId === 3) throw new Error('Add rejected');
            await operations.addUserToChat(args);
        },
    }), /some members could not be added/);
    assert.deepEqual(added, [2, 3]);
    const after = transport.getSnapshot();
    assert.deepEqual(after.chats.find(chat => chat.id === oldId), oldChat);
    assert.deepEqual(after.chats.at(-1)?.userIds, [creatorId, 2]);
});
