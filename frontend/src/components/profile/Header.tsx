import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

import type { TUser } from "@typesFolder/authType";

import FollowButton from "@components/user/FollowButton";
import FriendList from "@components/user/FriendList";
import MessageButton from "@components/messenger/MessageButton";
import { Button } from "@components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@components/ui/avatar";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
} from "@components/ui/dialog";

import { ImSpinner2 } from "react-icons/im";

import defaultProfile from "@assets/default-profile.png";
interface IHeaderProps {
  id: string;
  userProfile: TUser | undefined;
  isMyProfile: boolean;
  userProfileLoading: boolean;
}
const Header = ({
  userProfile,
  isMyProfile,
  userProfileLoading,
  id,
}: IHeaderProps) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [followingDialogOpen, setFollowingDialogOpen] = useState(false);
  const { pathname } = useLocation();

  const onOpenchange = (open: boolean) => {
    setDialogOpen(open);
  };

  const handleOpenChange = (open: boolean) => {
    setFollowingDialogOpen(open);
  };

  useEffect(() => {
    setDialogOpen(false);
    setFollowingDialogOpen(false);
  }, [pathname]);

  return (
    <div
      className={`flex ${
        isMyProfile ? "justify-end" : "justify-between"
      } items-center bg-card p-4 rounded gap-2`}
    >
      {!isMyProfile && (
        <div className="flex items-center gap-2">
          <FollowButton id={id} />

          <MessageButton reciver={userProfile as TUser} />
        </div>
      )}
      <div className="flex items-center gap-3">
        <div className="text">
          <h1 className="text-xl font-bold capitalize">
            {userProfile?.fullName}
          </h1>
          <p className="text-sm text-gray-500">{userProfile?.bio}</p>
          <div className="flex items-center gap-2">
            <Dialog onOpenChange={onOpenchange} open={dialogOpen}>
              <DialogTrigger>
                <p className="text-[10px] md:text-sm text-gray-500 flex items-center">
                  {userProfile?.followers.length} followers
                </p>
              </DialogTrigger>
              <DialogContent
                aria-describedby={undefined}
                className="w-[calc(100%-40px)] md:w-full max-h-[calc(100vh-300px)] overflow-y-auto  hide-scrollbar "
              >
                <DialogTitle>Followers</DialogTitle>
                {userProfile?.followers.map((follower) => (
                  <FriendList
                    key={follower._id}
                    user={follower}
                    type="follow"
                  />
                ))}
                {userProfile?.followers.length === 0 && (
                  <p className="text-sm text-gray-500">No followers</p>
                )}
                {userProfileLoading && (
                  <ImSpinner2 className="text-center text-2xl animate-spin" />
                )}
              </DialogContent>
            </Dialog>

            <Dialog onOpenChange={handleOpenChange} open={followingDialogOpen}>
              <DialogTrigger>
                <p className="text-[10px] md:text-sm text-gray-500 flex items-center">
                  {userProfile?.following.length} following
                </p>
              </DialogTrigger>
              <DialogContent
                aria-describedby={undefined}
                className="w-[calc(100%-40px)] md:w-full max-h-[calc(100vh-300px)] overflow-y-auto  hide-scrollbar"
              >
                <DialogTitle>Following</DialogTitle>
                {userProfile?.following.map((follower) => (
                  <FriendList
                    key={follower._id}
                    user={follower}
                    type="follow"
                  />
                ))}
                {userProfile?.following.length === 0 && (
                  <p className="text-sm text-gray-500">
                    You are not following anyone
                  </p>
                )}
                {userProfileLoading && (
                  <ImSpinner2 className="text-center text-2xl animate-spin" />
                )}
              </DialogContent>
            </Dialog>
          </div>
        </div>
        <Avatar className="w-[60px] h-[60px]  md:w-[80px] md:h-[80px]">
          <AvatarImage src={userProfile?.profileImg?.url || defaultProfile} />
          <AvatarFallback>{userProfile?.username.slice(0, 1)}</AvatarFallback>
        </Avatar>
        {/* <img
          src={data?.profileImg?.url}
          alt={data?.username}
          className="rounded-full w-[100px] h-[100px]"
        /> */}
      </div>
    </div>
  );
};

export default Header;
