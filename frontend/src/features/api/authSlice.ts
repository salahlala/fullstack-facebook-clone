import { apiSlice } from "@features/api/apiSlice";
import type { authType, TUser } from "@typesFolder/authType";
import type { ApiError } from "@typesFolder/apiError";
interface AuthResponse {
  data: TUser;
  token: string;
  message: string;
}

export const authSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<AuthResponse, authType>({
      query: (credentials: authType) => ({
        url: "/auth/login",
        method: "POST",
        body: credentials,
      }),
      transformResponse: (response: AuthResponse) => response,
      transformErrorResponse(response: { status: number; data: ApiError }) {
        return {
          status: response.status,
          message: response.data?.message || "Something went wrong",
        };
      },
      invalidatesTags: [{ type: "User", id: "CURRENT_USER" }],
    }),
    signup: builder.mutation<void, authType>({
      query: (credentials: authType) => ({
        url: "/auth/signup",
        method: "POST",
        body: credentials,
      }),
      invalidatesTags: [{ type: "User", id: "CURRENT_USER" }],
    }),
    logout: builder.mutation<void, void>({
      query: () => ({
        url: "/auth/logout",
        method: "POST",
      }),
      invalidatesTags: [{ type: "User", id: "CURRENT_USER" }],
    }),
    // getMe: builder.query<TUser, void>({
    //   query: () => "/auth/me",
    //   keepUnusedDataFor: 30,

    //   transformErrorResponse(response: { status: number; data: ApiError }) {
    //     return {
    //       status: response.status,
    //       message: response.data?.message || "Something went wrong",
    //     };
    //   },
    //   providesTags: [{ type: "User", id: "CURRENT_USER" }],
    // }),
    // getUserProfile: builder.query<TUser, string>({
    //   query: (username) => ({
    //     url: `/users/profile/${username}`,
    //     method: "GET",
    //   }),
    //   transformResponse: (response: { data: TUser }) => response.data,
    //   providesTags: (result) =>
    //     result ? [{ type: "User", id: result._id }] : [],
    // }),
  }),
});

export const { useLoginMutation, useSignupMutation, useLogoutMutation } =
  authSlice;
