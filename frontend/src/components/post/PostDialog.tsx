import { Link } from "react-router-dom";
import { useAppSelector } from "@store/hooks";
import type { TPost, TComment } from "@typesFolder/postType";

import { IoClose, IoReload } from "react-icons/io5";
import { ImSpinner2 } from "react-icons/im";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@components/ui/dialog";
interface User {
  _id: string;
  username: string;
  profileImg: string;
}
interface PostDialogProps<T> {
  post: TPost;
  onOpenChange: (open: boolean) => void;
  title: string;
  type: "likesDialog" | "commentDetailsDialog" | "addCommentDialog";
  loading: boolean;
  deleteCommentLoading?: boolean;
  data: T[];
  renderContent: (item: T) => JSX.Element;
}
const PostDialog = <T,>({
  post,
  onOpenChange,
  title,
  type,
  loading,
  deleteCommentLoading,
  data,
  renderContent,
}: PostDialogProps<T>) => {
  const dialogData = useAppSelector((state) => state.dialog[post._id]);
  const isOpen = dialogData?.[type] || false;

  return (
    <Dialog onOpenChange={onOpenChange} open={isOpen}>
      <DialogTrigger>
        <p className="dark:text-white/60 text-black/60">{title}</p>
      </DialogTrigger>
      <DialogContent
        aria-describedby={undefined}
        className={`max-h-[calc(100vh-300px)] w-[calc(100%-40px)] md:w-full  overflow-y-auto p-0 hide-scrollbar ${
          deleteCommentLoading ? " pointer-events-none" : ""
        }`}
      >
        <DialogHeader className=" sticky top-0 z-20 bg-background p-4">
          <div className="flex items-center justify-between ">
            <DialogTitle className="">{title}</DialogTitle>
            <DialogClose className="text-2xl">
              <IoClose />
            </DialogClose>
          </div>
          {loading && (
            <div className="flex justify-center items-center">
              <ImSpinner2 className="text-center text-2xl animate-spin" />
            </div>
          )}
          {/* loop on data array and show user  */}
        </DialogHeader>
        <div className="p-4">{data?.map(renderContent)}</div>
      </DialogContent>
    </Dialog>
  );
};

export default PostDialog;
