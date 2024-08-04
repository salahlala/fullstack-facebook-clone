import {Link} from "react-router-dom";
import { Popover, PopoverContent, PopoverTrigger } from "@components/ui/popover";
import { Button } from "@components/ui/button";

import { BsThreeDots } from "react-icons/bs";
import ReactTimeAgo from "react-time-ago";
import { TPost } from "@typesFolder/postType";

import { MdEdit } from "react-icons/md";
import { IoReload } from "react-icons/io5";
import { FaTrashAlt } from "react-icons/fa";

interface PostHeaderProps {
  post: TPost;
  userId: string | undefined;
  isLoading: boolean;
  onDelete: () => void;
 }

const PostHeader = ({post, userId, isLoading, onDelete}: PostHeaderProps) => {
  return (
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-3">
        <Link to={`/profile/${post.user._id}`}>
          <div className="w-[30px] h-[30px] rounded-full bg-primary">
            <img src="" alt="" className="" />
          </div>
        </Link>

        <div className="">
          <Link to={`/app/profile/${post.user._id}`}>
            <h2 className="font-bold text-xl text-card-foreground">
              {post.user.username}
            </h2>
          </Link>
          <p className="font-medium dark:text-white/60 text-black/60 text-sm">
            <ReactTimeAgo date={new Date(post?.createdAt)} locale="en-US" />
          </p>
          {/* name 
                    time 
                  */}
        </div>
      </div>

      {userId === post.user._id && (
        <Popover>
          <PopoverTrigger>
            <BsThreeDots className="dark:text-white/60" />
          </PopoverTrigger>
          <PopoverContent>
            <div className="flex flex-col gap-3">
              <div className="flex gap-2 cursor-pointer items-center dark:hover:bg-white/10 hover:bg-black/10 p-2 rounded-md">
                <MdEdit className="" />
                <p>Edit</p>
              </div>
              {isLoading && (
                <Button disabled>
                  <IoReload className="mr-2 w-4 animate-spin" />
                  please wait
                </Button>
              )}
              {!isLoading && (
                <div
                  className={` flex gap-2 cursor-pointer items-center dark:hover:bg-white/10 hover:bg-black/10 p-2 rounded-md`}
                  onClick={onDelete}
                >
                  <FaTrashAlt className="" />
                  <p>Delete</p>
                </div>
              )}
            </div>
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
};

export default PostHeader;
