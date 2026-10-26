import type { ChatListItemDTO, CreateChatDTO } from './types.ts';

interface GroupChatOperations {
    getChats: () => Promise<ChatListItemDTO[]>;
    createChat: (dto: CreateChatDTO) => Promise<void>;
    addUserToChat: (args: { chatId: number; userId: number }) => Promise<void>;
}

export async function createGroupChatWithMembers(
    dto: CreateChatDTO,
    creatorId: number,
    memberIds: number[],
    operations: GroupChatOperations,
): Promise<number> {
    // POST /Chat returns OkResponse without data, so take a fresh ID snapshot first.
    const previousIds = new Set((await operations.getChats()).map(chat => chat.id));
    await operations.createChat(dto);

    let chats: ChatListItemDTO[];
    try {
        chats = await operations.getChats();
    } catch (cause) {
        throw new Error('The group was created, but its ID could not be verified. No members were added. Close this dialog and check your chats.', { cause });
    }

    const candidates = chats.filter(chat =>
        !previousIds.has(chat.id) && chat.isGroup && chat.creatorId === creatorId
    );
    const created = candidates.length === 1 ? candidates[0] : undefined;
    if (!created || !Number.isSafeInteger(created.id) || created.id <= 0 ||
        created.name !== dto.name || created.coverId !== dto.coverId) {
        throw new Error('The created group could not be identified uniquely. No members were added. Close this dialog and check your chats.');
    }

    for (const userId of memberIds) {
        try {
            await operations.addUserToChat({ chatId: created.id, userId });
        } catch (cause) {
            throw new Error('The group was created, but some members could not be added. Close this dialog and manage members from the chat.', { cause });
        }
    }

    return created.id;
}
