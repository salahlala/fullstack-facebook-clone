import { useEffect, useRef } from "react";
import { Outlet } from "react-router";
import { useLocation } from "react-router-dom";

import { useGetNotificationsQuery } from "@features/api/notificationSlice";

import { closeAllDialogs } from "@store/dialogUiSlice";
import { useAppDispatch, useAppSelector } from "@store/hooks";

import Header from "@components/common/Header";
import { Toaster } from "@components/ui/toaster";

import { io, Socket } from "socket.io-client";
import { setSocket } from "@store/socketSlice";
const ProtectLayout = () => {
  const { pathname } = useLocation();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const socket = useRef<Socket | null>(null);
  const { refetch: refetchNotifications } = useGetNotificationsQuery();

  useEffect(() => {
    if (user) {
      socket.current = io("ws://localhost:8000", {
        query: {
          userId: user._id,
        },
      });
      dispatch(setSocket(socket.current));
    }

    const handleNewNotification = () => {
      refetchNotifications();
    };
    socket.current?.on("new-notification", handleNewNotification);

    return () => {
      socket.current?.disconnect();
      socket.current?.off("new-notification", handleNewNotification);
    };
  }, [user, dispatch, refetchNotifications]);

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
