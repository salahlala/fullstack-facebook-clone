import { useState, useEffect, useRef, useCallback } from "react";
import { useParams } from "react-router";
import { Link } from "react-router-dom";
import { apiSlice } from "@features/api/apiSlice";
import {
  useGetChatByIdQuery,
  useGetChatsQuery,
} from "@features/api/messengerApiSlice";

import MessageCard from "@components/messenger/MessageCard";
import OnlineStatus from "@components/messenger/OnlineStatus";
import { Avatar, AvatarFallback, AvatarImage } from "@components/ui/avatar";
import { Input } from "@components/ui/input";
import { Button } from "@components/ui/button";

import { TMessage } from "@typesFolder/messengerType";

import { useAppSelector, useAppDispatch } from "@store/hooks";
import {
  useSendMessageMutation,
  useGetMessagesQuery,
} from "@features/api/messengerApiSlice";

import { ImSpinner2 } from "react-icons/im";
import { IoMdClose } from "react-icons/io";
import {
  updateMessagesStatusCache,
  updateUnseenMessagesCache,
  updateNewMessagesCache,
} from "@utils/cacheUtils";
const MessengerPage = () => {
  const { chatId } = useParams<{ chatId: string }>();
  // console.log({ chatId });
  const {
    data: messages,
    isLoading: messagesLoading,
    refetch: refetchMessages,
  } = useGetMessagesQuery(chatId!, {
    refetchOnMountOrArgChange: true,
  });
  const {
    data: chat,
    isLoading: chatLoading,
    refetch: refetchChat,
  } = useGetChatByIdQuery(chatId!, {
    refetchOnMountOrArgChange: true,
  });

  const [sendMessage] = useSendMessageMutation();
  const [messageContent, setMessageContent] = useState("");
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { socket, onlineUsers } = useAppSelector((state) => state.socket);
  const reciver = chat?.members.filter((member) => member._id !== user._id)[0];

  // console.log(chat);
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessageContent(e.target.value);
  };
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (messageContent.trim().length === 0) return;
    const data = await sendMessage({
      content: messageContent,
      chatId: chatId!,
      senderId: user._id,
    }).unwrap();
    setMessageContent("");
    updateNewMessagesCache(dispatch, chatId!, data);
    // dispatch(
    //   apiSlice.util.updateQueryData(
    //     "getMessages",
    //     chatId,
    //     (draft: TMessage[]) => {
    //       draft.push(data);
    //     }
    //   )
    // );
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (!socket || !chat?._id) return;

    const handleNewMessage = (data: TMessage) => {
      if (data.chat === chat?._id) {
        // console.log("new message", data);
        // Update cache directly with the new message
        updateNewMessagesCache(dispatch, chatId!, data);
        // dispatch(
        //   apiSlice.util.updateQueryData(
        //     "getMessages",
        //     chatId,
        //     (draft: TMessage[]) => {
        //       draft.push(data);
        //     }
        //   )
        // );

        // dispatch(
        //   apiSlice.util.invalidateTags([
        //     { type: "Message" as const, id: data._id },
        //   ])
        // );
        // refetchMessages();
        // refetchAllChats();
      }
    };

    socket.on("new-message", handleNewMessage);
    // socket.on("message-sent", handleMessageSent);
    return () => {
      socket.off("new-message", handleNewMessage);
      // socket.off("message-sent", handleMessageSent);
    };
    // scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [socket, chat, dispatch, chatId]);

  useEffect(() => {
    const timer = setTimeout(() => {
      scrollRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 200);
    return () => clearTimeout(timer);
  }, [messages, chatId]);

  useEffect(() => {
    if (messages?.length && reciver) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage?.sender?._id !== user?._id) {
        socket?.emit("messageRead", { chatId, user: reciver._id });
        if (chatId) {
          updateUnseenMessagesCache(dispatch, chatId);
        }
        // dispatch(
        //   apiSlice.util.invalidateTags([
        //     { type: "Message", id: `UNSEEN-${chatId}` },
        //   ])
        // );
      }
    }
  }, [chatId, messages, socket, user, reciver, dispatch]);

  const handleMessageRead = useCallback(
    (data: { chatId: string; messagesToUpdate: TMessage[] }) => {
      const { chatId: updatedChat, messagesToUpdate } = data;
      if (updatedChat == chat?._id) {
        // Update cache directly with the new message
        updateMessagesStatusCache(dispatch, updatedChat, messagesToUpdate);
        // dispatch(
        //   apiSlice.util.updateQueryData(
        //     "getMessages",
        //     chatId,
        //     (draft: TMessage[]) => {
        //       // Replace the old messages with the updated ones
        //       messagesToUpdate.forEach((updatedMessage) => {
        //         const index = draft.findIndex(
        //           (msg) => msg._id === updatedMessage._id
        //         );
        //         if (index !== -1) {
        //           draft[index] = { ...draft[index], ...updatedMessage }; // Replace the old message with the updated one
        //         }
        //       });
        //     }
        //   )
        // );
      }
    },
    [dispatch, chat]
  );

  useEffect(() => {
    if (!socket || !chat) return;

    socket.on("readMessage", handleMessageRead);
    return () => {
      socket.off("readMessage", handleMessageRead);
    };
  }, [socket, chat, handleMessageRead]);

  useEffect(() => {
    if (!socket || !chat || !reciver) return;
    if (reciver) {
      const filteredMessage = messages?.filter(
        (message) => message.status == "sent"
      );
      const isReciverOnline = onlineUsers.includes(reciver._id);

      if (filteredMessage?.length && isReciverOnline) {
        console.log("user is online from messenger page", reciver);
        socket.emit("user-status", {
          reciverId: reciver._id,
          status: "online",
          senderId: user._id,
          messages: filteredMessage,
          chatId: chat?._id,
        });
      }
    }
    return () => {
      socket.off("user-status");
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket, onlineUsers, reciver, user, chat]);

  useEffect(() => {
    socket?.on("messageDelivered", ({ chatId, messagesToUpdate }) => {
      if (chatId == chat?._id) {
        console.log(messagesToUpdate);
        console.log("message delivered");
        updateMessagesStatusCache(dispatch, chatId, messagesToUpdate);
        // dispatch(
        //   apiSlice.util.updateQueryData(
        //     "getMessages",
        //     chatId,
        //     (draft: TMessage[]) => {
        //       // Replace the old messages with the updated ones
        //       messagesToUpdate.forEach((updatedMessage: TMessage) => {
        //         const index = draft.findIndex(
        //           (msg) => msg._id === updatedMessage._id
        //         );
        //         if (index !== -1) {
        //           draft[index] = { ...draft[index], ...updatedMessage }; // Replace the old message with the updated one
        //         }
        //       });
        //     }
        //   )
        // );
        // refetchMessages();
      }
    });
  }, [socket, chat, dispatch]);

  return (
    // <div className="flex min-h-screen gap-1 pt-[70px]">
    <div className="messages basis-full max-h-[calc(100vh-70px)] bg-card flex flex-col">
      <div
        className={`header sticky top-0 shadow-md bg-card dark:bg-secondary p-4 basis-[10%]`}
      >
        <div className="flex items-center gap-2 justify-between ">
          {messagesLoading || chatLoading ? (
            <ImSpinner2 className="animate-spin text-3xl" />
          ) : (
            <>
              <div className="relative flex items-center gap-2 ">
                <Avatar>
                  <AvatarImage src={reciver?.profileImg.url} />
                  <AvatarFallback>
                    {reciver?.fullName[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <h1 className="text-2xl capitalize">{reciver?.fullName}</h1>
                {reciver && <OnlineStatus reciver={reciver?._id} />}
              </div>
              <Link
                to="/app/messenger"
                className="dark:hover:bg-background hover:bg-black/10 rounded transition-colors"
              >
                <IoMdClose className="text-3xl cursor-pointer" />
              </Link>
            </>
          )}
        </div>

        {/* 
            user img 
            user status
            close chat button
          */}
      </div>
      <div className="messageContent my-3 p-4 overflow-y-auto basis-full hide-scrollbar ">
        {messagesLoading || chatLoading ? (
          <ImSpinner2 className="animate-spin text-3xl grid place-content-center mx-auto" />
        ) : (
          <>
            {messages?.map((message: TMessage) => (
              <div ref={scrollRef} key={message._id}>
                <MessageCard message={message} reciver={reciver!} />
              </div>
            ))}
          </>
        )}
      </div>
      <div className="textArea bottom-0 flex p-4 basis-[10%] bg-card dark:bg-secondary shadow-md">
        <form action="" className="w-full flex gap-4" onSubmit={handleSubmit}>
          <Input
            className="w-full"
            placeholder="write a message"
            value={messageContent}
            onChange={handleInputChange}
          />
          <Button
            type="submit"
            className="button !mt-0 !w-auto dark:bg-background hover:!bg-card "
          >
            send
          </Button>
        </form>
      </div>
    </div>
  );
};

export default MessengerPage;
