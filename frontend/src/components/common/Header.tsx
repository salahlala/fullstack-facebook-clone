import { useNavigate } from "react-router";
import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

import { useAppDispatch } from "@store/hooks";
import { logout as logoutAction } from "@store/authSlice";

import { apiSlice } from "@features/api/apiSlice";
import { useLogoutMutation } from "@features/api/authApiSlice";
import { useGetMeQuery, useSearchUsersQuery } from "@features/api/userApiSlice";
import {
  useGetNotificationsQuery,
  useMarkNotificationAsReadMutation,
} from "@features/api/notificationApiSlice";
import { useGetAllMessagesNotSeenQuery } from "@features/api/messengerApiSlice";

import SearchList from "@components/user/SearchList";
import Notification from "@components/user/Notification";

import { Input } from "@components/ui/input";

import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
} from "@components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@components/ui/popover";
import { Avatar, AvatarFallback, AvatarImage } from "@components/ui/avatar";
import { ModeToggle } from "@components/mode-toggle";

import { FaUserFriends } from "react-icons/fa";
import { FaFacebookMessenger } from "react-icons/fa6";
import { MdLogout, MdSettings, MdPerson } from "react-icons/md";
import { BsFillBellFill } from "react-icons/bs";
import { IoIosSearch } from "react-icons/io";

import notificationSound from "@assets/notification.mp3";
const Header = () => {
  const [logout] = useLogoutMutation();
  const { data } = useGetMeQuery();
  const { data: notifications } = useGetNotificationsQuery();
  const [markNotificationAsRead] = useMarkNotificationAsReadMutation();
  const { data: allMessages } = useGetAllMessagesNotSeenQuery();
  const [isAnimated, setIsAnimated] = useState(false);
  const [queryName, setQueryName] = useState("");
  const [debonceName, setDebonceName] = useState("");
  const [open, setOpen] = useState(false);

  const [openNotification, setOpenNotification] = useState(false);
  const { data: usersData, isLoading: isSearchLoading } = useSearchUsersQuery(
    debonceName,
    {
      skip: debonceName.trim().length === 0,
    }
  );

  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await logout()
        .unwrap()
        .then(() => {
          console.log("logged out");
        });
      dispatch(logoutAction());
      dispatch(apiSlice.util.resetApiState());

      navigate("/login", { replace: true });
    } catch (error) {
      console.log(error, "error from header logout ");
    }
  };

  useEffect(() => {
    if (queryName.trim().length == 0) {
      setDebonceName("");
    } else {
      const handler = setTimeout(() => {
        setDebonceName(queryName);
      }, 500);
      return () => clearTimeout(handler);
    }
  }, [queryName]);

  const handleDialogChange = (open: boolean) => {
    setOpen(open);
  };
  const handleNotificationChange = (open: boolean) => {
    setOpenNotification(open);
  };

  useEffect(() => {
    setOpen(false);
    // setSheetOpen(false);
    setQueryName("");
    setDebonceName("");
  }, [location]);

  useEffect(() => {
    if (openNotification && notifications?.unreadCount) {
      markNotificationAsRead();
    }
    setIsAnimated(true);
    const timeout = setTimeout(() => {
      setIsAnimated(false);
    }, 500);

    return () => clearTimeout(timeout);
  }, [notifications?.unreadCount, markNotificationAsRead, openNotification]);
  useEffect(() => {
    const audio = new Audio(notificationSound);
    audio.preload = "auto";

    if (allMessages) {
      audio.play();
    }

    return () => audio.pause();
  }, [allMessages]);
  return (
    <div className="fixed top-0 z-30 h-[70px] w-full p-4 bg-card shadow-md flex items-center justify-between md:gap-7 gap-2  ">
      <Link to="/app">
        <h1 className="text-2xl font-bold ">RippleChat</h1>
      </Link>

      <Dialog open={open} onOpenChange={handleDialogChange}>
        <DialogTrigger className=" ">
          <div className="md:flex items-center justify-between hidden text-start bg-background hover:bg-secondary transition-colors duration-75 rounded-full px-4 py-1  md:w-[200px]">
            <p>Search</p>
            <IoIosSearch className="text-lg" />
          </div>
          <IoIosSearch className="text-2xl md:hidden" />
        </DialogTrigger>
        <DialogContent
          className="md:w-full w-[calc(100%-40px)] "
          aria-describedby={undefined}
        >
          <DialogTitle className="text-center text-xl">Search</DialogTitle>
          <div className="relative">
            <Input
              placeholder="Search for users"
              className="w-full text-secondary-foreground bg-card px-3 py-1 rounded-full"
              onChange={(e) => setQueryName(e.target.value)}
            />
            <IoIosSearch className="text-lg absolute right-2 top-1/2 -translate-y-1/2 w-[30px] h-[30px] bg-card" />
          </div>

          <div className="mt-4 resultl p-4 max-h-[300px] overflow-auto hide-scrollbar ">
            {queryName.trim().length > 0 && (
              <SearchList users={usersData} isSearchLoading={isSearchLoading} />
            )}
          </div>
        </DialogContent>
      </Dialog>
      <Link to="/app/suggested-users" className="lg:hidden">
        <div className="icon  ">
          <FaUserFriends className="text-2xl" />
        </div>
      </Link>

      {/* <div className="hidden lg:flex items-center gap-4 justify-between w-full text-secondary-foreground">
        <div className="icon  ">
          <FaUserFriends className="text-2xl" />
        </div>
        <div className="icon ">
          <MdGroups2 className="text-2xl" />
        </div>
        <div className="icon ">
          <GoVideo className="text-2xl" />
        </div>
      </div> */}
      <div className="flex gap-3 items-center justify-end md:w-full text-secondary-foreground">
        <Link to="/app/messenger">
          <div className="icon relative ">
            <FaFacebookMessenger className="" />
            <div
              className={` ${
                !allMessages || allMessages === 0 ? "hidden" : "block"
              } absolute w-[15px] h-[15px] text-white grid place-content-center bg-blue-800 rounded-full top-0 right-0`}
            >
              {allMessages}
            </div>
          </div>
        </Link>

        <Popover
          onOpenChange={handleNotificationChange}
          open={openNotification}
        >
          <PopoverTrigger>
            <div className="icon relative ">
              <BsFillBellFill className="" />

              <div
                className={`${isAnimated ? "animate-bounce" : ""} ${
                  !notifications?.unreadCount ? "hidden" : ""
                } absolute w-[15px] h-[15px] text-white grid place-content-center bg-blue-800 rounded-full top-0 right-0`}
              >
                {notifications?.unreadCount}
              </div>
            </div>
          </PopoverTrigger>
          <PopoverContent
            className={`max-h-[400px] overflow-y-auto hide-scrollbar`}
          >
            {notifications?.notifications.map((notification) => (
              <Notification
                key={notification._id}
                notification={notification}
              />
            ))}

            {!notifications?.notifications.length && (
              <p className="text-center">No notifications</p>
            )}
          </PopoverContent>
        </Popover>

        <Popover>
          <PopoverTrigger>
            <Avatar>
              <AvatarImage src={data?.profileImg?.url} />
              <AvatarFallback>
                {data?.fullName.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            {/* <div className="w-[30px] h-[30px] bg-black rounded-full "></div> */}
          </PopoverTrigger>
          <PopoverContent className="flex flex-col gap-3 p-2 bg-primary-foreground border-background">
            <Link to={`/app/profile/${data?._id}`} className="block">
              <div className="flex items-center gap-2 cursor-pointer transition hover:bg-black/10 dark:hover:bg-white/10 p-3 rounded-md">
                <p className="capitalize">profile</p>
                <MdPerson className="text-2xl" />
              </div>
            </Link>
            <Link to="/app/setting" className="block">
              <div className="flex items-center gap-2 cursor-pointer transition hover:bg-black/10 dark:hover:bg-white/10 p-3 rounded-md">
                <p className="capitalize">setting</p>
                <MdSettings className="text-2xl" />
              </div>
            </Link>
            <div
              className="flex items-center gap-2 cursor-pointer transition hover:bg-black/10 dark:hover:bg-white/10 p-3 rounded-md"
              onClick={handleLogout}
            >
              <p className="capitalize">logout</p>
              <MdLogout className="text-2xl" />
            </div>
          </PopoverContent>
        </Popover>
        <ModeToggle />
      </div>
    </div>
  );
};

export default Header;
