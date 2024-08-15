import { apiSlice } from "@features/api/apiSlice";
import type { TUser } from "@typesFolder/authType";
import type { ApiError } from "@typesFolder/apiError";

import { store } from "@store/index";
export const userSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getMe: builder.query<TUser, void>({
      query: () => "/auth/me",

      transformErrorResponse(response: { status: number; data: ApiError }) {
        return {
          status: response.status,
          message: response.data?.message || "Something went wrong",
        };
      },
      providesTags: (result) =>
        result ? [{ type: "User", id: result._id }] : [],
    }),
    getUserProfile: builder.query<TUser, string>({
      query: (id) => ({
        url: `/users/profile/${id}`,
        method: "GET",
      }),
      transformResponse: (response: { data: TUser }) => response.data,
      providesTags: (result) =>
        result ? [{ type: "User", id: result._id }] : [],
    }),
    searchUsers: builder.query<TUser[], string>({
      query: (query) => ({
        url: `/users/search-users?name=${query}`,
      }),
      transformResponse: (response: { data: TUser[] }) => response.data,
    }),
    getSuggestedUsers: builder.query<TUser[], void>({
      query: () => ({
        url: "/users/suggested",
      }),
      transformResponse: (response: { data: TUser[] }) => response.data,
      providesTags: (result) =>
        (result || []).map((user) => ({ type: "User", id: user._id })),
    }),
    updateUserProfile: builder.mutation<TUser, FormData>({
      query: (data) => ({
        url: `/users/updateUser`,
        method: "PATCH",
        body: data,
      }),
      transformErrorResponse: (err: { status: number; data: ApiError }) => {
        return {
          status: err.status,
          message: err.data.message || "some error",
        };
      },
      invalidatesTags: (result) => [{ type: "User", id: result?._id }],
    }),
    followUser: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `/users/follow/${id}`,
        method: "POST",
      }),

      transformErrorResponse: (err: { status: number; data: ApiError }) => {
        return {
          status: err.status,
          message: err.data.message || "some error",
        };
      },
      invalidatesTags: (_, __, id) => {
        const userId = store.getState().auth.user?._id;
        console.log({ userId, id });
        return [
          { type: "User", id },
          { type: "User", id: userId },
        ];
      },
    }),
  }),
});

export const {
  useGetMeQuery,
  useGetUserProfileQuery,
  useGetSuggestedUsersQuery,
  useSearchUsersQuery,
  useLazySearchUsersQuery,
  useUpdateUserProfileMutation,
  useFollowUserMutation,
} = userSlice;
