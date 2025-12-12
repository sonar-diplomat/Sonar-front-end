export type { PostDTO, Artist, Post } from './model/types';
export { Api } from './api/api';
export * from './model/store';
export {
  useGetArtistByIdQuery,
  useGetArtistPostsQuery,
  useCreatePostMutation,
  useDeletePostMutation,
  useUpdatePostMutation,
} from './api/rtkApi';

