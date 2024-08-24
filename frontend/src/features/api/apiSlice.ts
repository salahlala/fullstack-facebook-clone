import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { logout } from "@store/authSlice";


const baseQuery = fetchBaseQuery({
  baseUrl: "http://localhost:8000/api/v1",
  credentials: "include",
});
// const { handleLogout } = useLogoutHandler();

const baseQueryWithReauth = async (args, api, extraOptions) => {
  const result = await baseQuery(args, api, extraOptions);
  if (result?.error?.status === 401) {
    console.log(args, "args url");
    if (args !== "/auth/me") {
      api.dispatch(logout());
      window.location.href = "/login";
    }
    // console.log(args,'args from reauth')
    // if (args.endpoint =)
  }
  return result;
};
export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Post", "User", "Notification"],
  keepUnusedDataFor: 30,
  endpoints: () => ({}),
});
