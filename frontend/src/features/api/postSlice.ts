import { apiSlice } from "@features/api/apiSlice";
import { TPost, TComment } from "@typesFolder/postType";
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
      transformResponse: (response: { data: TPost }) => response.data,
      providesTags: (result) =>
        result
          ? [
              { type: "Post", id: result._id },
              { type: "Post", id: "LIST" },
            ]
          : [{ type: "Post", id: "LIST" }],
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
              { type: "Post", id: "LIST" },
            ]
          : [{ type: "Post", id: "LIST" }],
    }),

    getFollowingPosts: builder.query<TPost[], void>({
      query: () => "/posts/following",
      transformResponse: (response: { data: TPost[] }) => response.data,
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ _id }) => ({
                type: "Post" as const,
                id: _id,
              })),
              { type: "Post", id: "LIST" },
            ]
          : [{ type: "Post", id: "LIST" }],
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
                id: `USER_POSTS_${user}`,
              })),
              { type: "Post", id: "LIST" },
              // { type: "Post", id: `USER_POSTS_${user._id}` },
            ]
          : [
              { type: "Post", id: "LIST" },
              { type: "Post", id: "USER_POSTS" },
            ],
    }),
    getLikedPosts: builder.query<TPost[], void>({
      query: (id) => `/posts/like/${id}`,
    }),
    getLikedPostDetails: builder.query<TPost, string>({
      query: (id) => `/posts/like/detail/${id}`,

      transformResponse: (response: { data: TPost }) => response.data,
    }),
    getPostComments: builder.query<TComment[], string>({
      query: (id) => `/posts/comments/${id}`,

      transformResponse: (response: { data: TComment[] }) => response.data,

      providesTags: (_, __, id) => [{ type: "Post", id }],
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
        result
          ? [
              { type: "Post", id: `USER_POSTS_${result.user}` },
              { type: "Post", id: "LIST" },
            ]
          : [{ type: "Post", id: "LIST" }],
    }),
    addComment: builder.mutation<TPost, { text: string; postId: string }>({
      query: (data) => ({
        url: `/posts/comment/${data.postId}`,
        method: "POST",
        body: data,
      }),

      invalidatesTags: (_, __, { postId }) => {
        const userId = store.getState().auth.user._id;
        return [
          { type: "Post", id: postId },
          { type: "User", id: userId },
        ];
      },
    }),
    addLike: builder.mutation<TPost, { id: string }>({
      query: ({ id }) => ({
        url: `/posts/like/${id}`,
        method: "POST",
      }),
      invalidatesTags: (_, __, { id }) => {
        const userId = store.getState().auth.user._id;
        return [
          { type: "Post", id },
          { type: "User", id: userId },
        ];
      },
    }),

    // }),
    deletePost: builder.mutation({
      query: (id: string) => ({
        url: `/posts/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Post", id: "LIST" }],
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
        return [{ type: "Post", id: postId }];
      },
    }),
    deleteComment: builder.mutation({
      query: ({ postId, commentId }) => ({
        url: `/posts/comment/${postId}/${commentId}`,
        method: "DELETE",
      }),
      invalidatesTags: (_, __, { postId }) => {
        const userId = store.getState().auth.user._id;
        return [
          { type: "Post", id: postId },
          { type: "User", id: userId },
        ];
      },
    }),
  }),
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
