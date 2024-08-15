import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  useGetMeQuery,
  useGetUserProfileQuery,
  useFollowUserMutation,
} from "@features/api/userSlice";
import FollowButton from "@components/user/FollowButton";
import FriendList from "@components/user/FriendList";

import { Button } from "@components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@components/ui/avatar";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
} from "@components/ui/dialog";
import { ImSpinner2 } from "react-icons/im";
const Header = ({ id }: { id: string }) => {
  const { data, isLoading: isLoadingProfile } = useGetUserProfileQuery(id, {
    refetchOnMountOrArgChange: true,
  });
  const { data: userLogin } = useGetMeQuery();
  const isMyProfile = userLogin?._id === id;
  const [dialogOpen, setDialogOpen] = useState(false);
  const { pathname } = useLocation();

  const onOpenchange = (open: boolean) => {
    setDialogOpen(open);
  };

  useEffect(() => {
    setDialogOpen(false);
  }, [pathname]);

  return (
    <div
      className={`flex ${
        isMyProfile ? "justify-end" : "justify-between"
      } items-center bg-card p-4 rounded gap-2`}
    >
      {!isMyProfile && (
        <div className="flex items-center gap-3 flex-wrap">
          <FollowButton id={id} />

          <Button className="button dark:bg-background">Message</Button>
        </div>
      )}
      <div className="flex items-center gap-3">
        <div className="text">
          <h1>{data?.username}</h1>
          <p className="text-sm text-gray-500">{data?.bio}</p>
          <Dialog onOpenChange={onOpenchange} open={dialogOpen}>
            <DialogTrigger>
              <p className="text-sm text-gray-500 flex items-center">
                {data?.followers.length} followers
              </p>
            </DialogTrigger>
            <DialogContent aria-describedby={undefined}>
              <DialogTitle>Followers</DialogTitle>
              {data?.followers.map((follower) => (
                <FriendList key={follower._id} user={follower} type="follow" />
              ))}
              {data?.followers.length === 0 && (
                <p className="text-sm text-gray-500">No followers</p>
              )}
              {isLoadingProfile && (
                <ImSpinner2 className="text-center text-2xl animate-spin" />
              )}
            </DialogContent>
          </Dialog>
        </div>
        <Avatar className="w-[80px] h-[80px]">
          <AvatarImage src={data?.profileImg?.url} />
          <AvatarFallback>{data?.username.slice(0, 1)}</AvatarFallback>
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
