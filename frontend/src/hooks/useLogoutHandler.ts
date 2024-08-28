import { apiSlice } from "@features/api/apiSlice";
import { useLogoutMutation } from "@features/api/authSlice";
import { useAppDispatch } from "@store/hooks";
import { logout as logoutAction } from "@store/authSlice";
import { useNavigate } from "react-router";
import { useCallback } from "react";
const useLogoutHandler = () => {
  const dispatch = useAppDispatch();
  const [logout, { isLoading, isError, error }] = useLogoutMutation();
  const navigate = useNavigate();
  const handleLogout = useCallback(async () => {
    try {
      console.log("logout called");
      await logout()
        .unwrap()
        .then(() => {
          dispatch(logoutAction());
          dispatch(apiSlice.util.resetApiState());
          navigate("/", { replace: true });
        });
    } catch (error) {
      console.log(error, "error from logout");
    }
  }, [logout, dispatch, navigate]);

  return { handleLogout, isLoading, isError, error };
};

export default useLogoutHandler;
