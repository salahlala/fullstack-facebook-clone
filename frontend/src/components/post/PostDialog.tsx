import { Link } from "react-router-dom";
import type { TPost, TComment } from "@typesFolder/postType";
import { IoClose, IoReload } from "react-icons/io5";
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
  loading: boolean;
  data: T[];
  renderContent: (item: T) => JSX.Element;
}
const PostDialog = <T,>({
  post,
  onOpenChange,
  title,
  loading,
  data,
  renderContent,
}: PostDialogProps<T>) => {
  return (
    <Dialog onOpenChange={onOpenChange}>
      <DialogTrigger>
        <p className="dark:text-white/60 text-black/60">{title}</p>
      </DialogTrigger>
      <DialogContent
        aria-describedby={undefined}
        className="max-h-[calc(100vh-100px)] overflow-y-auto p-0 hide-scrollbar"
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
              <IoReload className="text-center text-2xl animate-spin" />
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
