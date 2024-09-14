import { Link } from "react-router-dom";
import type { TUser } from "@typesFolder/authType";

import { useAppSelector } from "@store/hooks";

import FollowButton from "@components/user/FollowButton";
import { Avatar, AvatarFallback, AvatarImage } from "@components/ui/avatar";
import OnlineStatus from "@components/messenger/OnlineStatus";
import CardHover from "@components/user/CardHover";

import defaultProfile from "@assets/default-profile.png";
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
  return (
    <>
      <div
        key={user._id}
        className={`flex ${
          column && " flex-col-reverse"
        } gap-4 items-center justify-between`}
      >
        <div className="flex items-center gap-2 flex-grow justify-between">
          {type === "follow" ? <FollowButton id={user._id} /> : null}
          <CardHover user={user} />
        </div>
        {column ? (
          <div className="w-[150px] h-[150px] bg-secondary rounded-md">
            <Link to={`/app/profile/${user._id}`}>
              <img
                src={user.profileImg?.url}
                alt={user.fullName}
                className="w-full h-full rounded-md"
              />
            </Link>
          </div>
        ) : (
          <Link to={`/app/profile/${user._id}`} className="relative">
            <Avatar>
              <AvatarImage src={user.profileImg?.url} />
              <AvatarFallback>
                {user.fullName.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            {pos === "contact" && <OnlineStatus reciver={user._id} />}
          </Link>
        )}
      </div>
    </>
  );
};

export default FriendList;
