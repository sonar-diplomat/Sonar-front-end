export { Api } from './api/api';
export {
useCreatePostMutation,
useDeletePostMutation,useGetArtistByIdQuery,
useGetArtistPostsQuery,useUpdatePostMutation
} from './api/rtkApi';
export * from './model/store';
export type { Artist,Post,PostDTO } from './model/types';

