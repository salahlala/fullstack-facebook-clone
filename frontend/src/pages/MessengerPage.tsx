import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router";
import { Link } from "react-router-dom";

import { useGetChatByIdQuery } from "@features/api/messengerApiSlice";

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
import { IoMdSend } from "react-icons/io";
import {
  updateMessagesStatusCache,
  updateUnseenMessagesCache,
  updateNewMessagesCache,
  updateLastMessageCache,
} from "@utils/cacheUtils";
const MessengerPage = () => {
  const { chatId } = useParams<{ chatId: string }>();
  // console.log({ chatId });
  const { data: messages, isLoading: messagesLoading } = useGetMessagesQuery(
    chatId!,
    {
      refetchOnMountOrArgChange: true,
    }
  );
  const { data: chat, isLoading: chatLoading } = useGetChatByIdQuery(chatId!, {
    refetchOnMountOrArgChange: true,
  });

  const [sendMessage, { isLoading: sendMessageLoading }] =
    useSendMessageMutation();
  const [messageContent, setMessageContent] = useState("");
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { socket, onlineUsers } = useAppSelector((state) => state.socket);

  const receiver = chat?.members.filter(
    (member) => member._id?.toString() !== user._id
  )[0];

  // set message in the redux store

  // console.log({ user, receiver });
  // console.log(chat);
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessageContent(e.target.value);
  };
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (messageContent.trim().length === 0) return;

    try {
      const data = await sendMessage({
        content: messageContent,
        chatId: chatId!,
      }).unwrap();
      setMessageContent("");

      socket?.emit("send-message", {
        ...data,
        receiver: receiver?._id,
      });
      // console.log({ data });
      updateLastMessageCache(dispatch, data);
      updateNewMessagesCache(dispatch, chatId!, data);
      // updateChatsCache(dispatch, data.chat);

      // scroll to the latest message
      scrollRef.current?.scrollIntoView({ behavior: "smooth" });
    } catch (error) {
      console.log("error", error);
    }
  };

  useEffect(() => {
    if (!socket || !chat?._id) return;

    const handleNewMessage = (data: TMessage) => {
      if (data.chat.toString() === chat?._id) {
        console.log("new message", { data });
        // Update cache directly with the new message
        updateNewMessagesCache(dispatch, data.chat.toString(), data);
        updateLastMessageCache(dispatch, data);
      }
    };

    const handleMessageRead = (data: {
      chatId: string;
      messagesToUpdate: TMessage[];
    }) => {
      const { chatId: updatedChat, messagesToUpdate } = data;
      if (updatedChat == chat?._id) {
        setTimeout(() => {
          if (dispatch && chat) {
            console.log("is ready");
            updateMessagesStatusCache(dispatch, updatedChat, messagesToUpdate);
          }
        }, 180);
      }
    };
    const handleMessageDelivered = ({
      chatId,
      messagesToUpdate,
    }: {
      chatId: string;
      messagesToUpdate: TMessage[];
    }) => {
      console.log({ chatId, chat }, "from message delivered");
      if (chatId == chat?._id) {
        console.log("message is delivered and will update");

        updateMessagesStatusCache(dispatch, chatId, messagesToUpdate);
      }
    };
    socket.on("new-message", handleNewMessage);

    socket.on("readMessage", handleMessageRead);
    socket.on("messageDelivered", handleMessageDelivered);
    // socket.on("message-sent", handleMessageSent);
    return () => {
      socket.off("new-message", handleNewMessage);
      socket.off("readMessage", handleMessageRead);
      socket.off("messageDelivered", handleMessageDelivered);
      // socket.off("message-sent", handleMessageSent);
    };
    // scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [socket, chat, dispatch, chatId]);

  useEffect(() => {
    // scroll when loading message is done
    if (!messagesLoading) {
      const timer = setTimeout(() => {
        scrollRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 200);

      return () => clearTimeout(timer);
    }
  }, [messages, chatId, messagesLoading]);

  useEffect(() => {
    if (!messagesLoading) {
      console.log("unseen cache updated");

      updateUnseenMessagesCache(dispatch, chatId!);
    }
  }, [messagesLoading, dispatch, chatId]);

  useEffect(() => {
    // send event that message is read
    if (messages?.length && receiver && chatId && user) {
      const lastMessage = messages[messages.length - 1];

      if (lastMessage?.sender?._id?.toString() !== user._id.toString()) {
        if (socket) {
          socket.emit("messageRead", { chatId, receiver: receiver._id });

          // Update unseen messages cache
          console.log("message is read and update unseen cache");
          updateUnseenMessagesCache(dispatch, chatId);
        }
      }
    }

    // Send user status event when receiver is online
    if (receiver) {
      const filteredMessage = messages?.filter(
        (message) => message.status == "sent"
      );
      const isReciverOnline = onlineUsers.includes(receiver._id);

      if (filteredMessage?.length && isReciverOnline) {
        console.log("user is online and send event");
        // console.log("user is online from messenger page", receiver);
        if (socket) {
          socket.emit("user-status", {
            reciverId: receiver._id,
            senderId: user._id,
            messages: filteredMessage,
            chatId,
          });
        }
      }
    }
  }, [chatId, messages, socket, user, receiver, dispatch, onlineUsers]);

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
                  <AvatarImage src={receiver?.profileImg.url} />
                  <AvatarFallback>
                    {receiver?.fullName[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <h1 className="text-2xl capitalize">{receiver?.fullName}</h1>
                {receiver && <OnlineStatus reciver={receiver?._id} />}
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
                <MessageCard message={message} />
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
            autoFocus
          />

          <Button
            type="submit"
            className="button !mt-0 !w-auto "
            disabled={sendMessageLoading || messageContent.trim().length < 1}
          >
            {sendMessageLoading ? (
              <ImSpinner2 className="animate-spin" />
            ) : (
              <IoMdSend className="text-2xl" />
            )}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default MessengerPage;
