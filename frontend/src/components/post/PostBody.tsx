import { Link } from "react-router-dom";
import { useAppSelector } from "@store/hooks";
import { useDeleteCommentMutation } from "@features/api/postSlice";

import type { TPost, TComment } from "@typesFolder/postType";
import FollowButton from "@components/user/FollowButton";
import PostDialog from "@components/post/PostDialog";
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
import { Button } from "@components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@components/ui/avatar";

import { HiOutlineDotsHorizontal } from "react-icons/hi";
import { FaTrashAlt } from "react-icons/fa";
import { ImSpinner2 } from "react-icons/im";
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
  profileImg: {
    public_id: string;
    url: string;
  };
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
  const { user: userLogin } = useAppSelector((state) => state.auth);
  const [deleteComment, { isLoading }] = useDeleteCommentMutation();
  const renderLikeContent = (user: User) => {
    // const checkFollowing = userLogin.following.find((u) => u._id === user._id);
    return (
      <div className="flex  items-center justify-between !mb-3" key={user._id}>
        <div className="flex items-center gap-3">
          <FollowButton id={user._id} />
          <Link to={`/app/profile/${user._id}`} className="mt-4">
            <p>{user.username}</p>
          </Link>
        </div>
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src={user.profileImg?.url} />
            <AvatarFallback>
              {user.username.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    );
  };

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
        {(comment.user._id === userLogin?._id ||
          post.user._id === userLogin?._id) && (
          <Popover>
            <PopoverTrigger>
              <div className="w-[30px] h-[30px] rounded-full hover:bg-card transition-colors grid place-content-center">
                <HiOutlineDotsHorizontal />
              </div>
            </PopoverTrigger>
            <PopoverContent>
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
                          Delete Post
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() =>
                            deleteComment({
                              postId: post._id,
                              commentId: comment._id,
                            })
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
          title={`Likes (${
            likedData?.likes.length || post.likes?.length || 0
          })`}
          renderContent={renderLikeContent}
          loading={loadingLikedData}
          data={likedData?.likes || []}
          type="likesDialog"
        />

        <PostDialog<TComment>
          post={post}
          onOpenChange={openCommentDetailsDialog}
          title={`Comments (${
            commentsData?.length || post.comments?.length || 0
          })`}
          renderContent={renderCommentContent}
          loading={loadingComments}
          data={commentsData || []}
          deleteCommentLoading={isLoading}
          type="commentDetailsDialog"
        />

        {/* <p className="dark:text-white/60 text-black/60">
          {post.comments?.length} comments
        </p> */}
      </div>
    </div>
  );
};

export default PostBody;
