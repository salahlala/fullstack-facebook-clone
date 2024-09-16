import { apiSlice } from "@features/api/apiSlice";
import type { TPost, TComment } from "@typesFolder/postType";
import type { TUser } from "@typesFolder/authType";
import { ApiError } from "@typesFolder/apiError";

import { store } from "@store/index";
export const postSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getPosts: builder.query<TPost[], void>({
      query: () => "/posts",

      transformResponse: (response: { data: TPost[] }) => response.data,
      transformErrorResponse: (err: { status: number; data: ApiError }) => {
        return {
          status: err.status,
          message: err.data.message || "some error",
        };
      },
      providesTags: (result) => {
        const postTags =
          result?.map(({ _id }) => ({
            type: "Post" as const,
            id: _id,
          })) || [];

        return [...postTags, { type: "Post", id: "LIST" }];
      },
    }),
    getPostById: builder.query<TPost, string>({
      query: (id) => `/posts/${id}`,
      keepUnusedDataFor: 0,
      transformResponse: (response: { data: TPost }) => response.data,
      transformErrorResponse: (err: { status: number; data: ApiError }) => {
        return {
          status: err.status,
          message: err.data.message,
        };
      },
      providesTags: (result) =>
        result ? [{ type: "Post" as const, id: result._id }] : [],
    }),
    getMyPosts: builder.query<TPost[], void>({
      query: () => "/posts/me",
      transformResponse: (response: { data: TPost[] }) => response.data,
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ _id }) => ({
                type: "Post" as const,
                id: _id,
              })),
              ...result.map(({ user }) => ({
                type: "Post" as const,
                id: `USER_POSTS_${user._id}`,
              })),
            ]
          : [],
    }),

    getFollowingPosts: builder.query<
      { posts: TPost[]; hasMorePosts: boolean },
      { limit?: number }
    >({
      query: ({ limit }) => `/posts/following?limit=${limit}`,
      transformResponse: (response: {
        data: { posts: TPost[]; hasMorePosts: boolean };
      }) => {
        return {
          posts: response.data.posts,
          hasMorePosts: response.data.hasMorePosts,
        };
      },
      providesTags: (result) =>
        result
          ? [
              ...result.posts.map(({ _id }) => ({
                type: "Post" as const,
                id: _id,
              })),
            ]
          : [],
    }),
    getUserPosts: builder.query<TPost[], string>({
      query: (id: string) => `/posts/user/id/${id}`,
      transformResponse: (response: { data: TPost[] }) => response.data,
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ _id }) => ({
                type: "Post" as const,
                id: _id,
              })),
              ...result.map(({ user }) => ({
                type: "Post" as const,
                id: `USER_POSTS_${user._id}`,
              })),
              // { type: "Post", id: `USER_POSTS_${user._id}` },
            ]
          : [],
    }),
    getLikedPosts: builder.query<TPost[], void>({
      query: (id) => `/posts/like/${id}`,
    }),
    getLikedPostDetails: builder.query<TUser[], string>({
      query: (id) => `/posts/like/detail/${id}`,

      transformResponse: (response: { data: TUser[] }) => response.data,
      // invalidatesTags: (_, __, id: string) => [
      //   { type: "Post", id: `POST_LIKES_${id}` },
      // ],
    }),
    getPostComments: builder.query<TComment[], string>({
      query: (id) => `/posts/${id}/comments`,

      transformResponse: (response: { data: TComment[] }) => response.data,
      // providesTags: (_, __, id) => [
      //   // { type: "Post" as const, id },
      //   // { type: "Post", id: `POST_COMMENTS_${id}` },
      // ],
    }),
    createPost: builder.mutation<TPost, FormData>({
      query: (data) => ({
        url: "/posts",
        method: "POST",
        body: data,
      }),
      transformErrorResponse: (err: { status: number; data: ApiError }) => {
        return {
          status: err.status,
          message: err.data.message || "some error",
        };
      },
      invalidatesTags: (result) =>
        result ? [{ type: "Post", id: `USER_POSTS_${result?.user?._id}` }] : [],
    }),
    addComment: builder.mutation<TPost, { text: string; postId: string }>({
      query: (data) => ({
        url: `/posts/comment/${data.postId}`,
        method: "POST",
        body: data,
      }),
    }),
    addLike: builder.mutation<TPost, { id: string }>({
      query: ({ id }) => ({
        url: `/posts/like/${id}`,
        method: "POST",
      }),
      invalidatesTags: () => {
        const userId = store.getState().auth.user._id;
        return [
          // { type: "Post", id: `POST_LIKES_${id}` },
          { type: "User", id: userId },
        ];
      },
    }),

    deletePost: builder.mutation({
      query: (id: string) => ({
        url: `/posts/${id}`,
        method: "DELETE",
      }),
    }),
    updatePost: builder.mutation<TPost, FormData>({
      query: (formData) => {
        const postId = formData.get("postId") as string;

        return {
          url: `/posts/${postId}`,
          method: "PATCH",
          body: formData,
        };
      },
      transformErrorResponse: (err: { status: number; data: ApiError }) => {
        return {
          status: err.status,
          message: err.data.message || "some error",
        };
      },
      invalidatesTags: (_, __, formData) => {
        const postId = formData.get("postId") as string;
        return [{ type: "Post" as const, id: postId }];
      },
    }),
    deleteComment: builder.mutation({
      query: ({ postId, commentId }) => ({
        url: `/posts/comment/${postId}/${commentId}`,
        method: "DELETE",
      }),
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetPostsQuery,
  useGetPostByIdQuery,
  useGetFollowingPostsQuery,
  useGetMyPostsQuery,
  useGetUserPostsQuery,
  useGetLikedPostsQuery,
  useGetLikedPostDetailsQuery,

  useLazyGetLikedPostDetailsQuery,
  useGetPostCommentsQuery,
  useLazyGetPostCommentsQuery,
  useCreatePostMutation,
  useAddCommentMutation,
  useAddLikeMutation,
  useDeletePostMutation,
  useUpdatePostMutation,
  useDeleteCommentMutation,
} = postSlice;
