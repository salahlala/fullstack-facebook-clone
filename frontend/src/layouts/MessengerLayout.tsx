import { Outlet } from "react-router";
import { useOutlet } from "react-router";
import { useEffect, useState } from "react";

import type { TChat, TMessage } from "@typesFolder/messengerType";
import {
  useGetChatsQuery,
  useCreateChatMutation,
  useGetChatsBySearchQuery,
} from "@features/api/messengerApiSlice";

import { useAppSelector, useAppDispatch } from "@store/hooks";
import {
  updateDeleteMessageCache,
  updateUnseenMessagesCache,
  updateChatsCache,
  updateCreateChatCache,
  updateLastMessageCache,
} from "@utils/messengerCache/index";

import ChatCard from "@components/messenger/ChatCard";

import { Input } from "@components/ui/input";
import { FaArrowRight } from "react-icons/fa";
import { ImSpinner2 } from "react-icons/im";
import { IoIosSearch } from "react-icons/io";
import { FiSidebar } from "react-icons/fi";

const MessengerLayout = () => {
  const { data: chats, isLoading } = useGetChatsQuery();
  const [createChat] = useCreateChatMutation();
  const { socket } = useAppSelector((state) => state.socket);
  const outlet = useOutlet();
  const dispatch = useAppDispatch();
  const [searchQuery, setSearchQuery] = useState("");
  const [debonceName, setDebonceName] = useState("");
  const [openSearch, setOpenSearch] = useState(false);
  const [closeSidebar, setCloseSidebar] = useState(false);
  const { data: searchData, isLoading: isSearchLoading } =
    useGetChatsBySearchQuery(debonceName);

  useEffect(() => {
    if (searchQuery.trim().length == 0) {
      setDebonceName("");
    } else {
      const timer = setTimeout(() => {
        setDebonceName(searchQuery);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [searchQuery]);

  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = async (data: TMessage) => {
      // check if there chat with this id
      const checkChatExist = chats?.find(
        (chat) => chat._id.toString() === data.chat.toString()
      );
      if (!checkChatExist) {
        if (data.receiver) {
          // create new chat
          const newChat = await createChat({
            userId: data.sender._id,
          }).unwrap();

          updateCreateChatCache(dispatch, newChat);
        }
      }
    };

    const handleMessageDeleted = (data: { chat: TChat; messageId: string }) => {
      // const chatId = data.chatId;

      updateDeleteMessageCache(dispatch, data.chat._id, data.messageId);
      updateChatsCache(dispatch, data.chat);

      console.log(data, "message delete");
    };

    socket.on("new-message", handleNewMessage);

    socket.on("message-deleted", handleMessageDeleted);
    return () => {
      socket.off("new-message", handleNewMessage);
      socket.off("message-deleted", handleMessageDeleted);
    };
  }, [socket, dispatch, createChat, chats]);

  const handleCloseSearch = () => {
    setSearchQuery("");
    setOpenSearch(false);
  };

  const handleCloseSidebar = () => {
    setCloseSidebar(!closeSidebar);
  };
  return (
    <div className="flex min-h-screen gap-1 pt-[70px]">
      {closeSidebar ? (
        <div className="basis-[50px] bg-card">
          <div className=" bg-card dark:bg-secondary p-4 shadow-md">
            <FiSidebar
              className="text-lg icon cursor-pointer"
              onClick={handleCloseSidebar}
            />
          </div>
        </div>
      ) : (
        <div
          className={`transition-all  ease-in-out overflow-y-auto hide-scrollbar  max-h-[calc(100vh-70px)]  bg-card  ${
            closeSidebar ? "basis-[50px]" : "basis-1/3"
          }`}
        >
          <div className="flex items-center justify-between z-30 sticky top-0 bg-card dark:bg-secondary p-4 shadow-md">
            <p className="font-bold">Messengers</p>
            <FiSidebar
              className="text-lg icon cursor-pointer"
              onClick={handleCloseSidebar}
            />
          </div>
          <div className="p-4 flex items-center gap-2 relative">
            <div className="w-full relative">
              <Input
                className="w-full px-3 py-1 rounded-full"
                placeholder="Search Messenger"
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setOpenSearch(true)}
                type="search"
                value={searchQuery}
                spellCheck={false}
              />
              <IoIosSearch className="text-lg absolute right-2 top-1/2 -translate-y-1/2 w-[30px] h-[30px] bg-background" />
            </div>

            {openSearch && (
              <div className="icon cursor-pointer" onClick={handleCloseSearch}>
                <FaArrowRight className="text-lg" />
              </div>
            )}
          </div>

          {isLoading || isSearchLoading ? (
            <ImSpinner2 className="m-auto animate-spin text-3xl" />
          ) : (
            <>
              {openSearch ? (
                <div>
                  {searchData?.length
                    ? searchData.map((chat: TChat) => (
                        <ChatCard key={chat._id} chat={chat} />
                      ))
                    : searchQuery.trim().length > 0 && (
                        <div className="flex justify-center items-center font-bold text-2xl">
                          No chat found
                        </div>
                      )}
                </div>
              ) : (
                chats?.map((chat: TChat) => (
                  <ChatCard key={chat._id} chat={chat} />
                ))
              )}
            </>
          )}
        </div>
      )}

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
