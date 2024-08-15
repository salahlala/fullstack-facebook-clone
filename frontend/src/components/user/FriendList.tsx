import { Link } from "react-router-dom";
import type { TUser } from "@typesFolder/authType";

import FollowButton from "@components/user/FollowButton";
import { Avatar, AvatarFallback, AvatarImage } from "@components/ui/avatar";
const FriendList = ({ user, type }: { user: TUser; type?: string }) => {
  return (
    <div key={user._id} className="flex gap-4 items-center justify-between">
      <div className="flex items-center gap-2">
        {type === "follow" ? <FollowButton id={user._id} /> : null}

        <Link to={`/app/profile/${user._id}`}>
          <h2>{user.username}</h2>
        </Link>
      </div>
      <Link to={`/app/profile/${user._id}`}>
        <Avatar>
          <AvatarImage src={user.profileImg?.url || ""} />
          <AvatarFallback>
            {user.username.slice(0, 1).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      </Link>
    </div>
  );
};

export default FriendList;
