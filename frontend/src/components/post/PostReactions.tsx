import { AiFillLike } from "react-icons/ai";
import { FaRegCommentAlt } from "react-icons/fa";
import { RiShareForwardLine } from "react-icons/ri";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@components/ui/dialog";
import { Textarea } from "@components/ui/textarea";
import { Button } from "@components/ui/button";

const PostReactions = () => {

  const handleLikeClick= () =>{}
  return (
    <div className="flex items-center gap-2 lg:gap-4  pt-3 justify-between text-card-foreground">
      <div className="flex items-center  gap-2 transition duration-75 hover:bg-black/10 dark:hover:bg-white/10 rounded-md px-2 py-1 lg:px-4 lg:py-2 cursor-pointer" onClick= {handleLikeClick}>
        <AiFillLike className="h-5" />
        <p className="h-5">like</p>
      </div>
      <Dialog>
        <DialogTrigger>
          <div className="flex items-center gap-2 transition duration-75  hover:bg-black/10 dark:hover:bg-white/10 rounded-md px-2 py-1 lg:px-4 lg:py-2 cursor-pointer">
            <FaRegCommentAlt className="h-5" />
            <p className="h-5">comment</p>
          </div>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="mb-4">Comments</DialogTitle>
            <DialogDescription>
              Write a comment or reply to a comment
            </DialogDescription>
            <Textarea
              className="resize-none "
              placeholder="Write a comment"
            />
            <Button className="!mt-4 shadow-md transition bg-primary text-white hover:bg-card hover:text-black dark:bg-card dark:text-white dark:hover:bg-primary dark:hover:text-black ">
              Comment
            </Button>
          </DialogHeader>
        </DialogContent>
      </Dialog>
      <div className="flex items-center  gap-2 transition duration-75  hover:bg-black/10 dark:hover:bg-white/10 rounded-md px-2 py-1 lg:px-4 lg:py-2 cursor-pointer">
        <RiShareForwardLine className="h-5" />
        <p className="h-5">share</p>
      </div>
    </div>
  );
};

export default PostReactions;
