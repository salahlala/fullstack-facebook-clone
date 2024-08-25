import { Link } from "react-router-dom";
import type { TUser } from "@typesFolder/authType";

import { useAppSelector } from "@store/hooks";

import FollowButton from "@components/user/FollowButton";
import { Avatar, AvatarFallback, AvatarImage } from "@components/ui/avatar";
const FriendList = ({
  user,
  type,
  column,
  pos,
}: {
  user: TUser;
  type?: string;
  column?: boolean;
  pos?: string;
}) => {
  const { onlineUsers } = useAppSelector((state) => state.socket);

  const isOnline = onlineUsers.includes(user._id);

  return (
    <>
      <div
        key={user._id}
        className={`flex ${
          column && " flex-col-reverse"
        } gap-4 items-center justify-between`}
      >
        <div className="flex items-center gap-2">
          {type === "follow" ? <FollowButton id={user._id} /> : null}

          <Link to={`/app/profile/${user._id}`} className="">
            <h2>{user.username}</h2>
          </Link>
        </div>
        {column ? (
          <div className="w-[150px] h-[150px] bg-secondary rounded-md">
            <Link to={`/app/profile/${user._id}`}>
              <img
                src={user.profileImg?.url || ""}
                alt={user.username}
                className="w-full h-full rounded-md"
              />
            </Link>
          </div>
        ) : (
          <Link to={`/app/profile/${user._id}`} className="relative">
            <Avatar>
              <AvatarImage src={user.profileImg?.url || ""} />
              <AvatarFallback>
                {user.username.slice(0, 1).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            {pos === "contact" && isOnline && (
              <div className="absolute bottom-1 z-10 w-3 h-3 rounded-full bg-green-500" />
            )}
          </Link>
        )}
      </div>
    </>
  );
};

export default FriendList;
