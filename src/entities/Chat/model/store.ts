export {
  useGetMessageQuery,
  useGetChatInfoQuery,
  useGetChatMessagesQuery,
  useCreateChatMutation,
  useSendMessageMutation,
  useDeleteMessageMutation,
  useAddUserToChatMutation,
  useLeaveChatMutation,
  useRemoveUserFromChatMutation,
  useUpdateChatCoverMutation,
  useUpdateChatNameMutation,
  useReadMessagesMutation,
  useReadAllMessagesMutation,
} from '../api/rtkApi';

// Legacy exports for backward compatibility
export {
  useGetMessageQuery as useGetMessage,
  useGetChatInfoQuery as useGetChatInfo,
  useGetChatMessagesQuery as useGetChatMessages,
  useCreateChatMutation as useCreateChat,
  useSendMessageMutation as useSendMessage,
  useDeleteMessageMutation as useDeleteMessage,
  useAddUserToChatMutation as useAddUserToChat,
  useLeaveChatMutation as useLeaveChat,
  useRemoveUserFromChatMutation as useRemoveUserFromChat,
  useUpdateChatCoverMutation as useUpdateChatCover,
  useUpdateChatNameMutation as useUpdateChatName,
  useReadMessagesMutation as useReadMessages,
  useReadAllMessagesMutation as useReadAllMessages,
} from '../api/rtkApi';
