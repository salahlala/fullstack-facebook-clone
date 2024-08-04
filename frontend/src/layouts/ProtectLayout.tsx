import { Outlet } from "react-router";
import { useEffect } from "react";
import Header from "@components/common/Header";
import { useGetMeQuery } from "@features/api/userSlice";
import { ApiError } from "@typesFolder/apiError";
import useLogoutHandler from "@hooks/useLogoutHandler";
import { useAppSelector } from "@store/hooks";
const ProtectLayout = () => {
  // const { handleLogout } = useLogoutHandler();
  // const user = useAppSelector((state) => state.auth.user);
  // useEffect(() => {
  //   if (!user._id) {
  //     handleLogout();
  //   }
  // }, [handleLogout, user]);

  return (
    <div className="">
      <Header />
      <div className="">
        <Outlet />
      </div>
    </div>
  );
};

export default ProtectLayout;
