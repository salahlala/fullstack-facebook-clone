import { useState } from "react";
import ReactTimeAgo from "react-time-ago";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@components/ui/popover";
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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@components/ui/tooltip";
import { useToast } from "@components/ui/use-toast";

import type { TMessage } from "@typesFolder/messengerType";

import { useAppSelector } from "@store/hooks";
import { useDeleteMessageMutation } from "@features/api/messengerApiSlice";

import { IoCheckmarkDoneSharp } from "react-icons/io5";
import { FaCheck } from "react-icons/fa6";
import { BsThreeDots } from "react-icons/bs";
import { FaTrashAlt } from "react-icons/fa";
import { ImSpinner2 } from "react-icons/im";

interface IMessageCardProps {
  message: TMessage;
}
const MessageCard = ({ message }: IMessageCardProps) => {
  const { user } = useAppSelector((state) => state.auth);
  const [deleteMessage, { isLoading: isDeleting }] = useDeleteMessageMutation();
  const own = message.sender._id === user._id;
  const [isOpen, setIsOpen] = useState(false);
  const [alertDialogOpen, setAlertDialogOpen] = useState(false);
  const [showIcon, setShowIcon] = useState(false);
  const { toast } = useToast();
  // console.log({ reciver });

  const handleOpenPopover = (open: boolean) => {
    setIsOpen(open);
  };
  const handleMessageDelete = async () => {
    try {
      await deleteMessage({
        messageId: message._id,
        chatId: message.chat._id,
      }).unwrap();
      toast({
        title: "Message Deleted",
        description: "Your message has been deleted",
      });
    } catch (error) {
      console.log(error);
    }
  };

  const handleMouseEnter = () => {
    setShowIcon(true);
  };
  const handleMouseLeave = () => {
    if (!isOpen) setShowIcon(false);
  };
  // console.log(message.status, "message status");
  return (
    <div
      className={`flex gap-2 items-center mb-3 max-w-full ${
        own ? "justify-end" : ""
      }`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      // onFocus={handleMouseEnter}
    >
      {own && (
        <Popover open={isOpen} onOpenChange={handleOpenPopover}>
          <PopoverTrigger>
            <div
              className={`icon dark:hover:bg-white/10 hover:bg-black/10 duration-75 transition-opacity ${
                showIcon
                  ? "opacity-100 pointer-events-auto"
                  : "opacity-0 pointer-events-none"
              }`}
            >
              <BsThreeDots className="dark:text-white/60" />
            </div>
          </PopoverTrigger>

          <PopoverContent>
            <div className="flex flex-col gap-3">
              <AlertDialog open={alertDialogOpen}>
                <AlertDialogTrigger onClick={() => setAlertDialogOpen(true)}>
                  <div
                    className={` flex gap-2 cursor-pointer items-center hover-color p-2 rounded-md`}
                  >
                    <FaTrashAlt className="" />
                    <p>Delete</p>
                  </div>
                </AlertDialogTrigger>
                <AlertDialogContent className="w-[calc(100%-40px)] md:w-full">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="font-bold">
                      Delete Message
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel
                      disabled={isDeleting}
                      onClick={() => setAlertDialogOpen(false)}
                    >
                      Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleMessageDelete}
                      className="bg-red-500 hover:bg-red-600 text-white"
                      disabled={isDeleting}
                    >
                      {isDeleting ? (
                        <>
                          please wait
                          <ImSpinner2 className="ms-2 w-4 animate-spin" />
                        </>
                      ) : (
                        "Delete"
                      )}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </PopoverContent>
        </Popover>
      )}
      {!own && (
        <img
          src={message.sender.profileImg?.url}
          alt="img"
          className="w-[40px] rounded-full"
        />
      )}
      <div
        className={`${
          own && "bg-primary text-white dark:bg-secondary"
        } bg-black/10  dark:bg-background  rounded-full py-2 px-4 break-words `}
      >
        {/* 
                message title contain user name and time of message
                content of message
              */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger className="cursor-auto">
              <div className={`flex gap-2 items-center`}>
                {message.status === "sent" && own && <FaCheck />}
                {message.status === "delivered" && own && (
                  <IoCheckmarkDoneSharp />
                )}
                {message.status === "read" && own && (
                  <IoCheckmarkDoneSharp className="text-blue-500" />
                )}

                <p className="text-lg text-start">{message.content}</p>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <ReactTimeAgo
                className={` dark:text-white/50 text-sm`}
                date={new Date(message.createdAt)}
              />
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
};

export default MessageCard;
