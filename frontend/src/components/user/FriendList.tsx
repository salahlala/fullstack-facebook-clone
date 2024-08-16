import { Link } from "react-router-dom";
import type { TUser } from "@typesFolder/authType";

import FollowButton from "@components/user/FollowButton";
import { Avatar, AvatarFallback, AvatarImage } from "@components/ui/avatar";
const FriendList = ({
  user,
  type,
  column,
}: {
  user: TUser;
  type?: string;
  column?: boolean;
}) => {
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

          <Link to={`/app/profile/${user._id}`}>
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
          <Link to={`/app/profile/${user._id}`}>
            <Avatar>
              <AvatarImage src={user.profileImg?.url || ""} />
              <AvatarFallback>
                {user.username.slice(0, 1).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </Link>
        )}
      </div>
    </>
  );
};

export default FriendList;
