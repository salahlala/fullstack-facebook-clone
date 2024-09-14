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
import {
  updateMessagesStatusCache,
  updateUnseenMessagesCache,
  updateNewMessagesCache,
  updateLastMessageCache,
} from "@utils/cacheUtils";

import { ImSpinner2 } from "react-icons/im";
import { IoMdClose } from "react-icons/io";
import { IoMdSend } from "react-icons/io";
import { MdEmojiEmotions } from "react-icons/md";

import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";
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
  const typingRef = useRef<HTMLDivElement | null>(null);

  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { socket, onlineUsers } = useAppSelector((state) => state.socket);
  const [isTypingUser, setIsTypingUser] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
  const receiver = chat?.members.filter(
    (member) => member._id?.toString() !== user._id
  )[0];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessageContent(e.target.value);
    if (!isTyping) {
      socket?.emit("typing", {
        receiver: receiver?._id,
      });
      setIsTyping(true);
    }
    if (typingTimeout.current) {
      clearTimeout(typingTimeout.current);
    }
    typingTimeout.current = setTimeout(() => {
      socket?.emit("stop-typing", {
        receiver: receiver?._id,
      });
      setIsTyping(false);
    }, 1000);
  };

  const handleEmojiClick = (emoji: any) => {
    setMessageContent((prev) => prev + emoji.native);
  };
  const handleShowEmojiPicker = () => {
    setIsEmojiPickerOpen(true);
  };

  const handleEmojiPickerClose = () => {
    if (isEmojiPickerOpen) {
      setIsEmojiPickerOpen(false);
    }
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
    if (typingRef.current) {
      typingRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [isTypingUser]);

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

  useEffect(() => {
    if (!socket) return;
    socket.on("typing", () => {
      setIsTypingUser(true);
    });
    socket.on("stop-typing", () => {
      setIsTypingUser(false);
    });

    return () => {
      socket.off("typing");
      socket.off("stop-typing");
    };
  }, [socket]);
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
              <Link
                to={`/app/profile/${receiver?._id}`}
                className="relative flex items-center gap-2 hover-color rounded-md px-2 cursor-pointer"
              >
                <Avatar>
                  <AvatarImage src={receiver?.profileImg.url} />
                  <AvatarFallback>
                    {receiver?.fullName[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <h1 className="text-2xl capitalize">{receiver?.fullName}</h1>
                {receiver && <OnlineStatus reciver={receiver?._id} />}
              </Link>
              <Link to="/app/messenger" className="hover-color rounded-full ">
                <IoMdClose className="text-2xl cursor-pointer" />
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
              <div ref={scrollRef} key={message._id} className="max-w-full ">
                <MessageCard message={message} />
              </div>
            ))}
            {isTypingUser && (
              <div className=" w-fit my-5 px-3">
                <div
                  className=" flex items-center gap-1 justify-center"
                  ref={typingRef}
                >
                  <div className="  rounded-full w-2.5 h-2.5 bg-black/10 dark:bg-white/10 animate-[typing-bounce_1s_infinite] " />
                  <div className=" rounded-full w-2.5 h-2.5 bg-black/10 dark:bg-white/10 animate-[typing-bounce_1s_infinite] delay-200" />
                  <div className=" rounded-full w-2.5 h-2.5 bg-black/10 dark:bg-white/10  animate-[typing-bounce_1s_infinite] delay-400" />
                </div>
                {/* <BsThreeDots className="animate-ping text-lg font-bold" /> */}
                {/* <span className="animate-ping text-2xl font-bold">...</span> */}
              </div>
            )}
          </>
        )}
      </div>
      <div className="textArea bottom-0 flex p-4 basis-[10%] bg-card dark:bg-secondary shadow-md">
        <form
          action=""
          className="w-full flex gap-4 relative"
          onSubmit={handleSubmit}
        >
          <div className="relative w-full">
            <Input
              className="w-full"
              placeholder="write a message"
              value={messageContent}
              onChange={handleInputChange}
              autoFocus
              disabled={sendMessageLoading}
            />
            <MdEmojiEmotions
              onClick={handleShowEmojiPicker}
              className="icon absolute right-2 top-1/2 -translate-y-1/2 text-2xl cursor-pointer"
            />
            <div
              className={`absolute right-0 opacity-0 bottom-[50px] scale-0 ${
                isEmojiPickerOpen ? "opacity-100 scale-100" : ""
              } transition-opacity `}
            >
              <Picker
                data={data}
                onEmojiSelect={handleEmojiClick}
                onClickOutside={handleEmojiPickerClose}
                searchPosition={"none"}
                skinTonePosition={"none"}
              />
            </div>
          </div>

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
