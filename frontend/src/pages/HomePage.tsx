import { useGetPostsQuery } from "@features/api/postSlice";
import {
  useGetMeQuery,
  useGetSuggestedUsersQuery,
} from "@features/api/userSlice";
import { useAppSelector } from "@store/hooks";
import type { TPost } from "@typesFolder/postType";
import type { TUser } from "@typesFolder/authType";

import Post from "@components/post/Post";
import Loader from "@components/Loader";
import Story from "@components/story/Story";
import CreatePost from "@components/post/CreatePost";
import FriendList from "@components/user/FriendList";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@components/ui/carousel";
import {
  IoMdSettings,
  IoMdSearch,
  IoMdVideocam,
  IoIosArrowDown,
} from "react-icons/io";
import { FaUserFriends } from "react-icons/fa";
import { MdGroups2 } from "react-icons/md";
import { GoVideo } from "react-icons/go";
import { BsThreeDots } from "react-icons/bs";
import { ImSpinner2 } from "react-icons/im";
const HomePage = () => {
  const { data: posts, isLoading, isError, error } = useGetPostsQuery();
  const { data: user } = useGetMeQuery();
  const { data: suggestedUser, isLoading: suggestedUserLoading } =
    useGetSuggestedUsersQuery();
  const { isDialogOpen } = useAppSelector((state) => state.ui);

  return (
    <div className="min-h-screen relative bg-background">
      {/* <div className="fixed top-0 z-30 h-[70px] w-full p-4 bg-white shadow-md flex items-center justify-between gap-7 ">
        <div className="xl:hidden">
          <Sheet>
            <SheetTrigger>
              <FaBars />
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Are you absolutely sure?</SheetTitle>
                <SheetDescription>
                  This action cannot be undone. This will permanently delete
                  your account and remove your data from our servers.
                </SheetDescription>
              </SheetHeader>
            </SheetContent>
          </Sheet>
        </div>
        <div className="w-full">
          <Input placeholder="search" className="w-full" />
        </div>
        <div className="hidden lg:flex items-center gap-4 justify-between w-full">
          <div className="w-[30px] h-[30px] grid place-items-center rounded-md ">
            <FaUserFriends className="text-2xl" />
          </div>
          <div className="w-[30px] h-[30px] grid place-items-center rounded-md ">
            <MdGroups2 className="text-2xl" />
          </div>
          <div className="w-[30px] h-[30px] grid place-items-center rounded-md ">
            <GoVideo className="text-2xl" />
          </div>
        </div>
        <div className="flex gap-3 items-center justify-end w-full">
          <Popover>
            <PopoverTrigger>
              <div className="w-[30px] h-[30px] grid place-items-center rounded-md ">
                <BsFillBellFill className="" />
              </div>
            </PopoverTrigger>
            <PopoverContent>Place content for the popover here.</PopoverContent>
          </Popover>

          <div className="w-[30px] h-[30px] grid place-items-center ">
            <BsMessenger className="" />
          </div>
          <div className="w-[30px] h-[30px] grid place-items-center">
            <BsGrid3X3Gap className="" />
          </div>
          <Popover>
            <PopoverTrigger>
              <div className="w-[30px] h-[30px] bg-black rounded-full "></div>
            </PopoverTrigger>
            <PopoverContent>Place content for the popover here.</PopoverContent>
          </Popover>
        </div>
        <div></div>
      </div> */}
      {/* <Header /> */}
      <div className="min-h-screen flex md:max-lg:container md:max-lg:mx-auto md:max-lg:px-4">
        <div className="basis-1/4 p-4  w-full h-[calc(100vh-70px)] hidden xl:flex flex-col gap-4 sticky top-[70px] z-10 ">
          <div className="blur-bg h-full  bg-card rounded-md p-4">
            <div className="text flex items-center justify-between text-card-foreground">
              <h1 className=" font-bold text-[45px]">facebook</h1>
              <div className="opacity-bg w-[30px] h-[30px]">
                <BsThreeDots className="" />
              </div>
            </div>
            <div className="flex flex-col gap-6 pt-6 text-card-foreground">
              <div className="flex gap-4 items-center">
                <FaUserFriends className=" text-2xl" />
                <p className=" capitalize">friends</p>
              </div>
              <div className="flex gap-4 items-center">
                <MdGroups2 className=" text-2xl" />
                <p className=" capitalize">groups</p>
              </div>
              <div className="flex gap-4 items-center">
                <GoVideo className=" text-2xl" />
                <p className=" capitalize">watch</p>
              </div>
              <div className="flex gap-4 items-center">
                <IoIosArrowDown className=" text-2xl" />
                <p className=" capitalize">see more</p>
              </div>
            </div>
          </div>
          <div className="blur-bg h-full text-card-foreground bg-card rounded-md p-4">
            <h1>Gaming</h1>
          </div>
        </div>
        <div className="mid  basis-full xl:basis-1/2 w-full p-4 mt-[70px]">
          <Carousel
            className="z-0 mb-4 "
            opts={{ slidesToScroll: 1, dragFree: true }}
          >
            <CarouselContent>
              <CarouselItem className="basis-1/2 md:basis-1/4 ">
                <Story />
              </CarouselItem>
              <CarouselItem className="basis-1/2 md:basis-1/4 ">
                <Story />
              </CarouselItem>
              <CarouselItem className="basis-1/2 md:basis-1/4 ">
                <Story />
              </CarouselItem>
              <CarouselItem className="basis-1/2 md:basis-1/4 ">
                <Story />
              </CarouselItem>
            </CarouselContent>
            {/* <CarouselPrevious /> */}
            {/* <CarouselNext /> */}
          </Carousel>
          <CreatePost />
          {isLoading ? (
            <div>
              <Loader />
            </div>
          ) : (
            <div className=" flex gap-3 flex-col ">
              {posts?.map((post: TPost) => (
                <Post key={post._id} post={post} />
              ))}
            </div>
          )}
        </div>
        <div className="right  basis-1/4 hidden xl:block h-[calc(100vh-70px)] p-4  sticky top-[70px]">
          <div className="flex items-cetner gap-4">
            {/* 
            -user img 
            - notifications
            - messengenr
            - apps
          */}
            {/* <div className="w-[30px] h-[30px] opacity-bg ">
              <BsFillBellFill className="" />
            </div>
            <div className="w-[30px] h-[30px] opacity-bg ">
              <BsMessenger className="" />
            </div>
            <div className="w-[30px] h-[30px] opacity-bg ">
              <BsGrid3X3Gap className="" />
            </div>

            <div className="w-[30px] h-[30px] bg-white rounded-full "></div> */}
          </div>
          <div className="contacts  p-4 bg-card rounded-md mb-4">
            <div className=" flex justify-between items-center text-card-foreground mb-4">
              <h2 className="font-bold   text-2xl">Contacts</h2>
              <div className="items-center flex gap-4">
                <IoMdVideocam className="" />
                <IoMdSearch className="" />
                <IoMdSettings className="" />
              </div>
            </div>
            <div className="flex-col flex gap-4">
              {user?.following?.map((user: TUser) => (
                <FriendList key={user._id} user={user} />
              ))}
            </div>
          </div>

          <div className="p-4 bg-card rounded-md">
            <h2 className="font-bold   text-2xl mb-1">suggested User</h2>
            <div className="flex-col flex gap-4">
              {suggestedUser?.map((user: TUser) => (
                <FriendList key={user._id} user={user} type="follow" />
              ))}
              {!suggestedUserLoading && suggestedUser?.length === 0 && (
                <p>No users found</p>
              )}
              {suggestedUserLoading && (
                <ImSpinner2 className="text-center text-2xl animate-spin" />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
