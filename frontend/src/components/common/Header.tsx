import { useNavigate } from "react-router";
import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

import { useAppDispatch } from "@store/hooks";
import { logout as logoutAction } from "@store/authSlice";

import { apiSlice } from "@features/api/apiSlice";
import { useLogoutMutation } from "@features/api/authSlice";
import { useGetMeQuery, useSearchUsersQuery } from "@features/api/userSlice";
import { useGetNotificationsQuery } from "@features/api/notificationSlice";

import SearchList from "@components/user/SearchList";
import SuggestedUser from "@components/user/SuggestedUser";
import Notification from "@components/user/Notification";

import { Badge } from "@components/ui/badge";
import { Input } from "@components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@components/ui/sheet";
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

import { FaUserFriends, FaBars } from "react-icons/fa";
import { MdGroups2, MdLogout, MdSettings, MdPerson } from "react-icons/md";
import { GoVideo } from "react-icons/go";
import { BsFillBellFill, BsMessenger } from "react-icons/bs";
import { IoMdSearch } from "react-icons/io";

const Header = () => {
  const [logout] = useLogoutMutation();
  const { data } = useGetMeQuery();
  const { data: notifications } = useGetNotificationsQuery();
  const [isAnimated, setIsAnimated] = useState(false);
  const [name, setName] = useState("");
  const [debonceName, setDebonceName] = useState("");
  const [open, setOpen] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const { data: usersData, isLoading: isSearchLoading } = useSearchUsersQuery(
    debonceName,
    {
      skip: debonceName.length < 1,
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
    const handler = setTimeout(() => {
      setDebonceName(name);
    }, 500);
    return () => clearTimeout(handler);
  }, [name]);

  const handleDialogChange = (open: boolean) => {
    setOpen(open);
  };

  const handleSheetChange = (open: boolean) => {
    setSheetOpen(open);
  };

  useEffect(() => {
    setOpen(false);
    setSheetOpen(false);
    setName("");
  }, [location]);

  useEffect(() => {
    setIsAnimated(true);
    const timeout = setTimeout(() => {
      setIsAnimated(false);
    }, 500);

    console.log(notifications?.length, "is animated");
    return () => clearTimeout(timeout);
  }, [notifications?.length]);

  return (
    <div className="fixed top-0 z-30 h-[70px] w-full p-4 bg-card shadow-md flex items-center justify-between gap-7 ">
      <Link to="/app">
        <h1 className="text-2xl font-bold ">facebook</h1>
      </Link>
      <div className="xl:hidden">
        <Sheet open={sheetOpen} onOpenChange={handleSheetChange}>
          <SheetTrigger>
            <FaBars />
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Are you absolutely sure?</SheetTitle>
              <SheetDescription>
                <SuggestedUser />
              </SheetDescription>
            </SheetHeader>
          </SheetContent>
        </Sheet>
      </div>
      <Dialog open={open} onOpenChange={handleDialogChange}>
        <DialogTrigger className=" ">
          <div className="md:block hidden text-start bg-background hover:bg-secondary transition-colors duration-100 rounded-md px-4 py-1  md:w-[200px]">
            search
          </div>
          <IoMdSearch className="text-2xl md:hidden" />
        </DialogTrigger>
        <DialogContent
          className="md:w-full w-[calc(100%-40px)] "
          aria-describedby={undefined}
        >
          <DialogTitle className="text-center">Search</DialogTitle>
          <Input
            placeholder="search"
            className="w-full text-secondary-foreground bg-card mt-4"
            onChange={(e) => setName(e.target.value)}
          />
          <div className="mt-4 resultl p-4 max-h-[300px] overflow-auto hide-scrollbar ">
            <SearchList users={usersData} isSearchLoading={isSearchLoading} />
          </div>
        </DialogContent>
      </Dialog>
      <div className="hidden lg:flex items-center gap-4 justify-between w-full text-secondary-foreground">
        <div className="w-[30px] h-[30px] grid place-items-center rounded-md  ">
          <FaUserFriends className="text-2xl" />
        </div>
        <div className="w-[30px] h-[30px] grid place-items-center rounded-md ">
          <MdGroups2 className="text-2xl" />
        </div>
        <div className="w-[30px] h-[30px] grid place-items-center rounded-md ">
          <GoVideo className="text-2xl" />
        </div>
      </div>
      <div className="flex gap-3 items-center justify-end w-full text-secondary-foreground">
        <Popover>
          <PopoverTrigger>
            <div className="w-[30px] h-[30px] grid place-items-center rounded-md relative">
              <BsFillBellFill className="" />

              <div
                className={`${isAnimated ? "animate-bounce" : ""} ${
                  !notifications?.length ? "hidden" : ""
                } absolute w-[15px] h-[15px] text-white grid place-content-center bg-blue-500 rounded-full top-0 right-0`}
              >
                {notifications?.length}
              </div>
            </div>
          </PopoverTrigger>
          <PopoverContent
            className={`${
              !notifications?.length ? "hidden" : ""
            } max-h-[400px] overflow-y-auto hide-scrollbar`}
          >
            {notifications?.notifications.map((notification) => (
              <Notification
                key={notification._id}
                notification={notification}
              />
            ))}
          </PopoverContent>
        </Popover>

        <div className="w-[30px] h-[30px] grid place-items-center  ">
          <BsMessenger className="" />
        </div>

        <Popover>
          <PopoverTrigger>
            <Avatar>
              <AvatarImage src={data?.profileImg?.url} />
              <AvatarFallback>
                {data?.username.slice(0, 1).toUpperCase()}
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
      <div></div>
    </div>
  );
};

export default Header;
