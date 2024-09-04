import { Avatar, AvatarFallback, AvatarImage } from "@components/ui/avatar";
import OnlineStatus from "@components/messenger/OnlineStatus";
import defaultImg from "@assets/default-profile.png";
import type { TChat } from "@typesFolder/messengerType";
import { useAppSelector, useAppDispatch } from "@store/hooks";
import { useGetMessagesNotSeenQuery } from "@features/api/messengerApiSlice";

import { Link, useNavigate } from "react-router-dom";
import ReactTimeAgo from "react-time-ago";
interface IChatCardProps {
  chat: TChat;
}

const ChatCard = ({ chat }: IChatCardProps) => {
  const { user } = useAppSelector((state) => state.auth);
  const { data, refetch } = useGetMessagesNotSeenQuery(chat._id);
  const navigate = useNavigate();
  const filterdData = chat.members.filter(
    (member) => member._id !== user._id
  )[0];

  // console.log(data);
  // console.log(chat.lastMessage);
  const handleOpenChat = async () => {
    // dispatch(setSelectedChat({ chat: chat._id, user: filterdData }));
    // const data = await getMessages(chat._id).unwrap();
    // dispatch(setMessages(data));
    refetch();
    navigate(`/app/messenger/${chat._id}`);
  };

  // console.log({ chat: chat.lastMessage });
  return (
    <div
      onClick={handleOpenChat}
      className="flex gap-4 items-center transition-colors dark:hover:bg-secondary hover:bg-black/10 p-4 rounded-md cursor-pointer"
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

          {data && data.length > 0 && (
            <span className="text-sm text-white bg-blue-500 w-[20px] h-[20px] rounded-full grid place-content-center ">
              {data.length}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatCard;
