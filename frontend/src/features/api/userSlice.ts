import { apiSlice } from "@features/api/apiSlice";
import type { authType, TUser } from "@typesFolder/authType";
import type { ApiError } from "@typesFolder/apiError";

export const userSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getMe: builder.query<TUser, void>({
      query: () => "/auth/me",
      keepUnusedDataFor: 30,

      transformErrorResponse(response: { status: number; data: ApiError }) {
        return {
          status: response.status,
          message: response.data?.message || "Something went wrong",
        };
      },
      providesTags: [{ type: "User", id: "CURRENT_USER" }],
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
  }),
});


export const { useGetMeQuery, useGetUserProfileQuery } = userSlice