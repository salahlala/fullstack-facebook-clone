import { useNavigate } from "react-router";
import { Link } from "react-router-dom";

import { useAppDispatch } from "@store/hooks";
import { logout as logoutAction } from "@store/authSlice";
import { apiSlice } from "@features/api/apiSlice";
import { useLogoutMutation } from "@features/api/authSlice";
import {  useGetMeQuery } from "@features/api/userSlice";

import useSignOut from "react-auth-kit/hooks/useSignOut";

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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@components/ui/popover";
import { ModeToggle } from "@components/mode-toggle";

import { FaUserFriends, FaBars } from "react-icons/fa";
import { MdGroups2, MdLogout, MdSettings, MdPerson } from "react-icons/md";
import { GoVideo } from "react-icons/go";
import { BsFillBellFill, BsMessenger, BsGrid3X3Gap } from "react-icons/bs";
const Header = () => {
  const [logout] = useLogoutMutation();
  const signOut = useSignOut();
  const { data } = useGetMeQuery();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const handleLogout = async () => {
    try {
      await logout()
        .unwrap()
        .then(() => {
          console.log("logged out");
        });
      signOut();
      dispatch(logoutAction());
      dispatch(apiSlice.util.resetApiState());


      navigate("/login", { replace: true });
    } catch (error) {
      console.log(error, "error from header logout ");
    }
  };

  return (
    <div className="fixed top-0 z-30 h-[70px] w-full p-4 bg-card shadow-md flex items-center justify-between gap-7 ">
      <Link to="/app">
        <h1 className="text-2xl font-bold ">facebook</h1>
      </Link>
      <div className="xl:hidden">
        <Sheet>
          <SheetTrigger>
            <FaBars />
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Are you absolutely sure?</SheetTitle>
              <SheetDescription>
                This action cannot be undone. This will permanently delete your
                account and remove your data from our servers.
              </SheetDescription>
            </SheetHeader>
          </SheetContent>
        </Sheet>
      </div>
      <div className="w-full">
        <Input
          placeholder="search"
          className="w-full text-secondary-foreground "
        />
      </div>
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
            <div className="w-[30px] h-[30px] grid place-items-center rounded-md ">
              <BsFillBellFill className="" />
            </div>
          </PopoverTrigger>
          <PopoverContent>Place content for the popover here.</PopoverContent>
        </Popover>

        <div className="w-[30px] h-[30px] grid place-items-center  ">
          <BsMessenger className="" />
        </div>
        <div className="w-[30px] h-[30px] grid place-items-center  ">
          <BsGrid3X3Gap className="" />
        </div>
        <Popover>
          <PopoverTrigger>
            <div className="w-[30px] h-[30px] bg-black rounded-full "></div>
          </PopoverTrigger>
          <PopoverContent className="flex flex-col gap-3 p-2 bg-primary-foreground border-background">
            <Link to={`/app/profile/${data?._id}`} className="block">
              <div className="flex items-center gap-2 cursor-pointer transition hover:bg-black/10 dark:hover:bg-white/10 p-3 rounded-md">
                <p className="capitalize">profile</p>
                <MdPerson className="text-2xl" />
              </div>
            </Link>
            <div className="flex items-center gap-2 cursor-pointer transition hover:bg-black/10 dark:hover:bg-white/10 p-3 rounded-md">
              <p className="capitalize">setting</p>
              <MdSettings className="text-2xl" />
            </div>
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
