import { Outlet } from "react-router";
import { useOutlet } from "react-router";
import { useEffect } from "react";

import type { TChat, TMessage } from "@typesFolder/messengerType";

import ChatCard from "@components/messenger/ChatCard";
import { Button } from "@components/ui/button";
import { Input } from "@components/ui/input";

import { useGetChatsQuery } from "@features/api/messengerApiSlice";
import { apiSlice } from "@features/api/apiSlice";
import { useAppSelector, useAppDispatch } from "@store/hooks";
import {
  updateDeleteMessageCache,
  updateUnseenMessagesCache,
} from "@utils/cacheUtils";

import { ImSpinner2 } from "react-icons/im";
const MessengerLayout = () => {
  const { data, isLoading } = useGetChatsQuery();
  const { socket } = useAppSelector((state) => state.socket);
  const outlet = useOutlet();
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!socket) return;
    const handleNewMessage = (data: TMessage) => {
      console.log("new message", data.chat);
      dispatch(
        apiSlice.util.invalidateTags([{ type: "Chat" as const, id: data.chat }])
      );
    };
    const handleMessageDelivered = (chatId: string) => {
      console.log("message delivered");
      updateUnseenMessagesCache(dispatch, chatId);
    };

    const handleMessageDeleted = (data: {
      chatId: string;
      messageId: string;
    }) => {
      const chatId = data.chatId;
      dispatch(
        apiSlice.util.updateQueryData(
          "getMessages",
          chatId,
          (draft: TMessage[]) => {
            return draft.filter(
              (message: TMessage) => message._id.toString() !== data.messageId
            );
          }
        )
      );
      // updateDeleteMessageCache(dispatch, data.chat, data.messageId);
      console.log(data, "message delete");
    };
    socket.on("message-delivered", handleMessageDelivered);
    socket.on("new-message", handleNewMessage);

    socket.on("message-deleted", handleMessageDeleted);
    return () => {
      socket.off("new-message", handleNewMessage);
      socket.off("message-delivered", handleMessageDelivered);
      socket.off("message-deleted", handleMessageDeleted);
    };
  }, [socket, dispatch]);

  return (
    <div className="flex min-h-screen gap-1 pt-[70px]">
      <div className="chats overflow-y-auto hide-scrollbar  max-h-[calc(100vh-70px)]  bg-card basis-1/3 ">
        <div className="font-bold z-30 sticky top-0 bg-card dark:bg-secondary p-4 shadow-md">
          Messengers
        </div>
        <form action="" className="flex items-center gap-2 my-2 p-4">
          <Input
            className=" w-full"
            placeholder="Search Messenger"
            type="search"
          />
          <Button className="button !mt-0 !w-auto dark:bg-secondary">
            Search
          </Button>
        </form>
        {/* <div className="bg-secondary mb-4">search</div> */}
        {isLoading && <ImSpinner2 className="m-auto animate-spin text-3xl" />}

        {data?.map((chat: TChat) => (
          <ChatCard key={chat._id} chat={chat} />
        ))}
      </div>
      {!outlet && (
        <div className="flex justify-center items-center font-bold text-4xl mx-auto basis-full">
          Select chat
        </div>
      )}
      <Outlet />
    </div>
  );
};

export default MessengerLayout;
