import { useEffect, useRef } from "react";
import { Outlet } from "react-router";
import { useLocation } from "react-router-dom";

import { useGetNotificationsQuery } from "@features/api/notificationApiSlice";

import { closeAllDialogs } from "@store/dialogUiSlice";
import { setSocket, setOnlineUsers } from "@store/socketSlice";
import { useAppDispatch, useAppSelector } from "@store/hooks";
import {
  updateUnseenMessagesCache,
  updateLastMessageCache,
} from "@utils/cacheUtils";

import Header from "@components/common/Header";
import { Toaster } from "@components/ui/toaster";

import { io, Socket } from "socket.io-client";

import { TMessage, TChat } from "@typesFolder/messengerType";
const ProtectLayout = () => {
  const { pathname } = useLocation();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const socket = useRef<Socket | null>(null);
  const { refetch: refetchNotifications } = useGetNotificationsQuery();

  useEffect(() => {
    if (user) {
      if (!socket.current || socket.current?.disconnected) {
        socket.current = io("ws://localhost:8000", {
          query: {
            userId: user._id,
          },
        });
        dispatch(setSocket(socket.current));
        const handleNewNotification = () => {
          refetchNotifications();
        };

        const handleNewMessage = async (data: TMessage) => {
          console.log("new message");
          // check if there chat with this id
          updateLastMessageCache(dispatch, data);
          updateUnseenMessagesCache(dispatch, data.chat.toString());
        };

        const handleMessageDelivered = (chat: TChat) => {
          console.log("message delivered");
          updateUnseenMessagesCache(dispatch, chat._id);
        };
        socket.current.on("new-message", handleNewMessage);
        socket.current.on("message-delivered", handleMessageDelivered);
        socket.current.on("getUsers", (users) => {
          dispatch(setOnlineUsers(users));
        });

        socket.current.on("new-notification", handleNewNotification);
      }
    }

    return () => {
      if (socket.current) {
        socket.current.disconnect();
        socket.current.off("getUsers");
        socket.current.off("new-notification");
      }
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
