import { apiSlice } from "@features/api/apiSlice";
import { TPost, TComment } from "@typesFolder/postType";
import { ApiError } from "@typesFolder/apiError";

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

      // result
      //   ? [
      //       ...result.map(({ _id }) => ({
      //         type: "Post" as const,
      //         id: _id,
      //       })),
      //       { type: "Post", id: "LIST" },
      //     ]
      //   : [{ type: "Post", id: "LIST" }],
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
              { type: "Post", id: "LIST" },
            ]
          : [{ type: "Post", id: "LIST" }],
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
        // headers: {
        //   "Content-Type": "application/json", // Ensure the server knows you're sending form data
        // },
      }),
      transformErrorResponse: (err: { status: number; data: ApiError }) => {
        return {
          status: err.status,
          message: err.data.message || "some error",
        };
      },
      invalidatesTags: [{ type: "Post", id: "LIST" }],
    }),
    addComment: builder.mutation<TPost, { text: string; postId: string }>({
      query: (data) => ({
        url: `/posts/comment/${data.postId}`,
        method: "POST",
        body: data,
      }),

      invalidatesTags: (_, __, { postId }) => [
        { type: "Post", id: postId },
        { type: "User", id: "CURRENT_USER" },
      ],
    }),
    addLike: builder.mutation<TPost, { id: string }>({
      query: ({ id }) => ({
        url: `/posts/like/${id}`,
        method: "POST",
      }),
      invalidatesTags: (_, __, { id }) => [
        { type: "Post", id },
        { type: "User", id: "CURRENT_USER" },
      ],
      // invalidatesTags: [{ type: "Post", id: "LIST" }],
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
      invalidatesTags: (_, __, { postId }) => [
        { type: "Post", id: postId },
        { type: "User", id: "CURRENT_USER" },
      ],
    }),
  }),
});

export const {
  useGetPostsQuery,
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
