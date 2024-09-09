import { apiSlice } from "@features/api/apiSlice";
import type { authType, TUser } from "@typesFolder/authType";
import type { ApiError } from "@typesFolder/apiError";
interface AuthResponse {
  data: TUser;
  token: string;
  message: string;
}

interface ResetResponse {
  token: string;
  user: TUser;
}
interface ResetRquest {
  token: string;
  password: string;
  passwordConfirm: string;
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

    forgotPassword: builder.mutation<{ message: string }, string>({
      query: (email) => ({
        url: "/auth/forgot-password",
        method: "POST",
        body: { email },
      }),
      transformErrorResponse(response: { status: number; data: ApiError }) {
        return {
          status: response.status,
          message: response.data?.message || "Something went wrong",
        };
      },
    }),
    resetPassword: builder.mutation<ResetResponse, ResetRquest>({
      query: ({ token, password, passwordConfirm }) => ({
        url: `/auth/reset-password/${token}`,
        method: "POST",
        body: { password, passwordConfirm },
      }),
      transformResponse: (response: ResetResponse) => response,
      transformErrorResponse(response: { status: number; data: ApiError }) {
        return {
          status: response.status,
          message: response.data?.message || "Something went wrong",
        };
      },
    }),
  }),
});

export const {
  useLoginMutation,
  useSignupMutation,
  useLogoutMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
} = authSlice;
