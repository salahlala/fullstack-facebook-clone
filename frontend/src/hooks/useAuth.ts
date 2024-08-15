import { useGetMeQuery } from "@features/api/userSlice";
import { useAppDispatch, useAppSelector } from "@store/hooks";
import { login as loginAction } from "@store/authSlice";
import useLogoutHandler from "./useLogoutHandler";
import { useEffect } from "react";
import { useNavigate } from "react-router";
import { useLocation } from "react-router-dom";
import { ApiError } from "@typesFolder/apiError";
const useAuth = () => {
  const { data, isLoading, isError, error } = useGetMeQuery();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isLoggedIn, user } = useAppSelector((state) => state.auth);
  const { handleLogout } = useLogoutHandler();
  const location = useLocation();

  useEffect(() => {
    if (!isError && !isLoading && data?._id) {
      dispatch(
        loginAction({
          _id: data._id,
          email: data.email,
          username: data.username,
        })
      );
      navigate(location.pathname, { replace: true });
    } else if (isError && !isLoading && !data?._id && !user?._id) {
      if (
        (error as ApiError).status === 401 &&
        location.pathname.includes("/app")
      ) {
        handleLogout();
      }
    }

    
    if (!isLoading && isError) {
      console.log(error, "get me auth");
    }
  }, [
    data,
    navigate,
    dispatch,
    isError,
    error,
    isLoading,
    location.pathname,
    handleLogout,
    user._id,
  ]);
  return { isLoading, isError, error, isLoggedIn, user };
};

export default useAuth;
