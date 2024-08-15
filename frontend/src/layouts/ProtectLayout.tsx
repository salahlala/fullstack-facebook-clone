import { useEffect } from "react";
import { Outlet } from "react-router";
import { useLocation } from "react-router-dom";
import { closeAllDialogs } from "@store/dialogUiSlice";
import { useAppDispatch } from "@store/hooks";
import Header from "@components/common/Header";
import { Toaster } from "@components/ui/toaster";
const ProtectLayout = () => {
  const { pathname } = useLocation();
  const dispatch = useAppDispatch();
  useEffect(() => {
    dispatch(closeAllDialogs());

    // Timeout to ensure the scroll happens after rendering
    const timer = setTimeout(() => {
      window.scrollTo(0, 0);
    }, 10); // Adjust the timeout if needed

    return () => clearTimeout(timer); // Cleanup timer on component unmount
  }, [pathname, dispatch]);

  return (
    <div className="">
      <Header />
      <div className="">
        <Outlet />
      </div>
      <Toaster />
    </div>
  );
};

export default ProtectLayout;
