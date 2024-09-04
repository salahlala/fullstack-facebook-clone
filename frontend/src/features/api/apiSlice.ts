import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { logout, login } from "@store/authSlice";
import { openDialog } from "@store/uiSlice";

const baseQuery = fetchBaseQuery({
  baseUrl: "http://localhost:8000/api/v1",
  credentials: "include",
});
// const { handleLogout } = useLogoutHandler();
// Create an abort controller instance
// const abortController = new AbortController();
let isSessionExpired = false;
const baseQueryWithReauth = async (args, api, extraOptions) => {
  if (isSessionExpired)
    return { error: { status: 401, message: "Session Expired" } };
  let result = await baseQuery(args, api, extraOptions);
  const user = api.getState().auth.user;

  if (result?.error?.status === 401 && user) {
    try {
      const refreshResult = await baseQuery(
        "/auth/refreshToken",
        api,
        extraOptions
      );

      if (refreshResult?.data) {
        console.log("sending refresh token");
        api.dispatch(login(user));

        result = await baseQuery(args, api, extraOptions);
      } else {
        if (args !== "/auth/me") {
          isSessionExpired = true;

          api.dispatch(openDialog("sessionExpired"));
          api.dispatch(logout());
        }
      }
    } catch (error) {
      api.dispatch(logout());
    }
  }
  return result;
};
export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Post", "User", "Notification", "Message", "Chats", "Chat"],
  keepUnusedDataFor: 30,
  endpoints: () => ({}),
});
