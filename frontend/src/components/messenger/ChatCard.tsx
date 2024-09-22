import { useNavigate } from "react-router-dom";
import ReactTimeAgo from "react-time-ago";
import { useInView } from "react-intersection-observer";

import { Avatar, AvatarFallback, AvatarImage } from "@components/ui/avatar";
import OnlineStatus from "@components/messenger/OnlineStatus";

import type { TChat } from "@typesFolder/messengerType";

import { useAppSelector } from "@store/hooks";
import { useGetMessagesNotSeenQuery } from "@features/api/messengerApiSlice";

import defaultImg from "@assets/default-profile.png";

interface IChatCardProps {
  chat: TChat;
}

const ChatCard = ({ chat }: IChatCardProps) => {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });
  const { data: messagesUnseen } = useGetMessagesNotSeenQuery(chat._id, {
    skip: !inView,
  });
  const { user } = useAppSelector((state) => state.auth);

  const navigate = useNavigate();
  // const { toast } = useToast();
  const filterdData = chat.members.filter(
    (member) => member._id !== user._id
  )[0];
  const handleOpenChat = async () => {
    navigate(`/app/messenger/${chat._id}`);
  };

  return (
    <div
      onClick={handleOpenChat}
      className="flex gap-4 items-center transition-colors hover-color p-4 rounded-md cursor-pointer"
      ref={ref}
    >
      <div className="relative ">
        <Avatar>
          <AvatarImage src={filterdData.profileImg.url || defaultImg} />
          <AvatarFallback>
            {filterdData.fullName[0].toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <OnlineStatus reciver={filterdData._id} />
      </div>
      <div className="flex justify-between items-center w-full">
        <div>
          <h1 className="text-2xl capitalize">{filterdData.fullName}</h1>
          {/* last message */}
          <p className="text-sm text-gray-400 ">
            {chat.lastMessage?.content.slice(0, 10)}
          </p>
        </div>
        <div className="flex flex-col gap-2 justify-end">
          {chat.lastMessage && (
            <ReactTimeAgo
              date={new Date(chat.lastMessage.createdAt)}
              locale="en-US"
            />
          )}

          {messagesUnseen && messagesUnseen.length > 0 && (
            <span className="text-sm text-white bg-blue-800 w-[20px] h-[20px] rounded-full grid place-content-center ">
              {messagesUnseen.length}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatCard;
