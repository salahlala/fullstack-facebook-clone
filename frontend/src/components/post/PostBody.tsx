import { Link } from "react-router-dom";
import { useAppSelector } from "@store/hooks";
import { useDeleteCommentMutation } from "@features/api/postSlice";

import type { TPost, TComment } from "@typesFolder/postType";

import PostDialog from "@components/post/PostDialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@components/ui/popover";
import { Button } from "@components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@components/ui/avatar";

import { HiOutlineDotsHorizontal } from "react-icons/hi";
import { FaTrashAlt } from "react-icons/fa";

interface PostBodyProps {
  post: TPost;
  likedData?: TPost;
  commentsData?: TComment[];
  loadingLikedData: boolean;
  loadingComments: boolean;
  openLikeDialog: (open: boolean) => void;
  openCommentDetailsDialog: (open: boolean) => void;
}

interface User {
  _id: string;
  username: string;
  profileImg: string;
}
const PostBody = ({
  post,
  likedData,
  commentsData,
  loadingLikedData,
  loadingComments,
  openLikeDialog,
  openCommentDetailsDialog,
}: PostBodyProps) => {
  const { user } = useAppSelector((state) => state.auth);
  const [deleteComment, { isLoading }] = useDeleteCommentMutation();
  const renderLikeContent = (user: User) => (
    <div className="flex items-center justify-between !mb-3" key={user._id}>
      <div className="flex items-center gap-3">
        <Button>add friend</Button>

        <Link to={`/app/profile/${user._id}`}>
          <p>{user.username}</p>
        </Link>
      </div>
      <Avatar>
        <AvatarImage src={user.profileImg?.url} />
        <AvatarFallback>{user.username.charAt(0).toUpperCase()}</AvatarFallback>
      </Avatar>
    </div>
  );

  const renderCommentContent = (comment: TComment) => (
    <div
      className={`flex items-center gap-5 !mb-3 ${
        isLoading && "pointer-events-none"
      }`}
      key={comment._id}
    >
      <Avatar>
        <AvatarImage src={comment.user.profileImg?.url} />
        <AvatarFallback>
          {comment.user.username.charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>

      <div className={`flex items-cetner gap-2`}>
        <div className="flex flex-col gap-[2px] bg-card rounded-lg px-3 py-1 min-w-[100px]">
          <Link to={`/app/profile/${comment.user._id}`}>
            <p className="font-bold">{comment.user.username}</p>
          </Link>
          <p>{comment.text}</p>
        </div>
        {(comment.user._id === user?._id || post.user._id === user?._id) && (
          <Popover>
            <PopoverTrigger>
              <div className="w-[30px] h-[30px] rounded-full hover:bg-card transition-colors grid place-content-center">
                <HiOutlineDotsHorizontal />
              </div>
            </PopoverTrigger>
            <PopoverContent>
              <div
                onClick={() =>
                  deleteComment({ postId: post._id, commentId: comment._id })
                }
                className={`${
                  isLoading && "pointer-events-none opacity-15"
                } flex items-center gap-1 cursor-pointer dark:hover:bg-white/10 hover:bg-black/10 p-2 rounded-md`}
              >
                <FaTrashAlt className="" />
                Delete
              </div>
            </PopoverContent>
          </Popover>
        )}
      </div>
    </div>
  );

  return (
    <div>
      <p className=" text-[15px] lg:text-lg lg:font-normal text-card-foreground">
        {post.text}
      </p>
      {post.img?.url && (
        <img src={post.img.url} alt="" className="  mb-3" loading="lazy" />
      )}

      <div className="flex justify-between items-center mt-2">
        {/* like dialog */}
        <PostDialog<User>
          post={post}
          onOpenChange={openLikeDialog}
          title={`Likes (${post?.likes?.length || 0})`}
          renderContent={renderLikeContent}
          loading={loadingLikedData}
          data={likedData?.likes || []}
        />

        <PostDialog<TComment>
          post={post}
          onOpenChange={openCommentDetailsDialog}
          title={`Comments (${post.comments?.length || 0})`}
          renderContent={renderCommentContent}
          loading={loadingComments}
          data={commentsData || []}
          deleteCommentLoading={isLoading}
        />

        {/* <p className="dark:text-white/60 text-black/60">
          {post.comments?.length} comments
        </p> */}
      </div>
    </div>
  );
};

export default PostBody;
