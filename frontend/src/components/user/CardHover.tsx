import { Link } from "react-router-dom";
import FollowButton from "@components/user/FollowButton";
import MessageButton from "@components/messenger/MessageButton";
import { Avatar, AvatarFallback, AvatarImage } from "@components/ui/avatar";
import {
  HoverCard,
  HoverCardTrigger,
  HoverCardContent,
  HoverCardPortal,
} from "@components/ui/hover-card";

import { TUser } from "@typesFolder/authType";

import defaultProfile from "@assets/default-profile.png";

interface CardHoverProps {
  user: TUser;
}

const CardHover = ({ user }: CardHoverProps) => {
  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <Link to={`/app/profile/${user._id}`}>
          <h2 className="font-bold text-xl text-card-foreground capitalize">
            {user.fullName}
          </h2>
        </Link>
      </HoverCardTrigger>
      <HoverCardPortal>
        <HoverCardContent
          side="top"
          sideOffset={10}
          align="start"
          className="w-[300px] z-[50]  shadow rounded-md "
        >
          <div className="flex items-center gap-6">
            <Link to={`/app/profile/${user._id}`}>
              <Avatar className="w-[60px] h-[60px]">
                <AvatarImage src={user.profileImg?.url || defaultProfile} />
                <AvatarFallback>
                  {user.username?.slice(0, 1).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </Link>

            <div>
              <Link to={`/app/profile/${user._id}`}>
                <h2 className="font-bold text-xl  capitalize">
                  {user.fullName}
                </h2>
              </Link>

              <p className="dark:text-white/60 text-black/60 text-base">
                {user.bio}
              </p>
              <p className="dark:text-white/60 text-black/60 text-sm">
                {user.followers?.length} followers
              </p>

              <div className="flex items-center gap-1">
                <FollowButton id={user._id} />
                <MessageButton reciver={user} />
              </div>
            </div>
          </div>
        </HoverCardContent>
      </HoverCardPortal>
    </HoverCard>
  );
};

export default CardHover;
