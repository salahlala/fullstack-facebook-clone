import { Link } from "react-router-dom";
import ReactTimeAgo from "react-time-ago";

import type { TNotification } from "@typesFolder/notificationType";

import { useDeleteNotificationByIdMutation } from "@features/api/notificationSlice";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@components/ui/alert-dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@components/ui/popover";
import { Avatar, AvatarFallback, AvatarImage } from "@components/ui/avatar";
import { Button } from "@components/ui/button";
import { BsThreeDots } from "react-icons/bs";
import { ImSpinner2 } from "react-icons/im";
import { FaTrashAlt } from "react-icons/fa";

const Notification = ({ notification }: { notification: TNotification }) => {
  const [deleteNotification, { isLoading }] =
    useDeleteNotificationByIdMutation();

  let message = "";
  switch (notification.type) {
    case "like":
      message = "liked your post";
      break;
    case "comment":
      message = "commented on your post";
      break;
    case "follow":
      message = "started following you";
      break;
    default:
      break;
  }

  return (
    <div className="bg-secondary rounded-md py-2 px-3 mb-3 relative">
      {notification.postId ? (
        <Link to={`/app/post/${notification.postId}`}>
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={notification.from?.profileImg.url} />
              <AvatarFallback>
                {notification.from?.username.slice(0, 1).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <p>{notification.from?.fullName}</p>
              <p>{message}</p>
              <p className="font-medium dark:text-white/60 text-black/60 text-sm">
                <ReactTimeAgo
                  date={new Date(notification?.createdAt || Date.now())}
                  locale="en-US"
                />
              </p>
            </div>
          </div>
        </Link>
      ) : (
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src={notification.from?.profileImg.url} />
            <AvatarFallback>
              {notification.from?.username.slice(0, 1).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <p>{notification.from?.username}</p>
            <p>{message}</p>
            <p className="font-medium dark:text-white/60 text-black/60 text-sm">
              <ReactTimeAgo
                date={new Date(notification?.createdAt || Date.now())}
                locale="en-US"
              />
            </p>
          </div>
        </div>
      )}
      <div className="absolute right-2 top-2">
        <Popover>
          <PopoverTrigger>
            <div className="w-[30px] h-[30px] rounded-full hover:bg-card transition-colors grid place-content-center">
              <BsThreeDots />
            </div>
          </PopoverTrigger>
          <PopoverContent className="">
            <div className="flex flex-col gap-3">
              {isLoading && (
                <Button disabled>
                  <ImSpinner2 className="mr-2 w-4 animate-spin" />
                  please wait
                </Button>
              )}
              {!isLoading && (
                <AlertDialog>
                  <AlertDialogTrigger>
                    <div
                      className={`${
                        isLoading && "pointer-events-none opacity-15"
                      } w-full flex items-center gap-1 cursor-pointer dark:hover:bg-white/10 hover:bg-black/10 p-2 rounded-md`}
                    >
                      <FaTrashAlt className="" />
                      <p>Delete</p>
                    </div>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle className="font-bold">
                        Delete Notification
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() =>
                          deleteNotification(notification._id).unwrap()
                        }
                        className="bg-red-500 hover:bg-red-600 text-white"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
};

// w-[30px] h-[30px] rounded-full hover:bg-card transition-colors grid place-content-center
export default Notification;
