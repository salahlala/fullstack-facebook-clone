import { useState, useEffect, useMemo } from "react";

import PostHeader from "@components/post/PostHeader";
import PostBody from "@components/post/PostBody";
import { Button } from "@components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@components/ui/dialog";
import { Textarea } from "@components/ui/textarea";
import { useToast } from "@components/ui/use-toast";

import emojiData from "@emoji-mart/data";
import Picker from "@emoji-mart/react";

import type { TComment, TPost } from "@typesFolder/postType";
import type { TNotification } from "@typesFolder/notificationType";
import type { TUser } from "@typesFolder/authType";

import { openDialog, closeDialog } from "@store/dialogUiSlice";
import { useAppDispatch, useAppSelector } from "@store/hooks";
import { useGetMeQuery } from "@features/api/userApiSlice";
import {
  useLazyGetLikedPostDetailsQuery,
  useLazyGetPostCommentsQuery,
  useDeletePostMutation,
  useAddLikeMutation,
  useAddCommentMutation,
} from "@features/api/postApiSlice";
import { useGetNotificationsQuery } from "@features/api/notificationApiSlice";

// cache
import {
  updateAddCommentCache,
  updateDeleteCommentCache,
  updateAddLikeCache,
  updateUnlikeCache,
} from "@utils/postsCache";

import { FaRegCommentAlt } from "react-icons/fa";
import { AiFillLike } from "react-icons/ai";
import { RiShareForwardLine } from "react-icons/ri";
import { MdEmojiEmotions } from "react-icons/md";

interface postProps {
  post: TPost;
  styles?: string;
}
const Post = ({ post, styles }: postProps) => {
  const { data } = useGetMeQuery();
  const [deletePost, { isLoading, isSuccess }] = useDeletePostMutation();
  const [addLike] = useAddLikeMutation();
  const [addComment, { isLoading: isLoadingComment }] = useAddCommentMutation();
  const [
    getLikedPostDetails,
    { data: likedData, isLoading: loadingLikedData },
  ] = useLazyGetLikedPostDetailsQuery();
  const [getPostComments, { data: commentsData, isLoading: loadingComment }] =
    useLazyGetPostCommentsQuery();

  const { refetch: refetchNotifications } = useGetNotificationsQuery();
  const { toast } = useToast();
  const [commentText, setCommentText] = useState("");
  const [openCommentDialog, setOpenCommentDialog] = useState(false);
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);

  const dispatch = useAppDispatch();
  const dialogData = useAppSelector((state) => state.dialog[post._id]);
  const commentDialogOpen = dialogData?.addCommentDialog || false;
  const { socket } = useAppSelector((state) => state.socket);

  const likedPostsSet = useMemo(
    () => new Set(data?.likedPosts?.map((id) => id.toString())),
    [data?.likedPosts]
  );
  const isPostLiked = likedPostsSet.has(post._id.toString());
  const [isOptimisticLiked, setIsOptimisticLiked] = useState(isPostLiked);

  useEffect(() => {
    if (!socket) return;
    const handleNewComment = (data: { postId: string; comment: TComment }) => {
      if (data.postId === post._id) {
        console.log("new comment");
        updateAddCommentCache(dispatch, data.postId, data.comment);
        // getPostComments(post._id);
      }
      // console.log(data, "from new comment socket");
    };
    const handleDeleteComment = (data: {
      postId: string;
      commentId: string;
    }) => {
      if (data.postId === post._id) {
        updateDeleteCommentCache(dispatch, data.postId, data.commentId);
        // getPostComments(post._id);
      }
    };

    const handleLikePost = (data: { postId: string; user: TUser }): void => {
      if (data.postId === post._id) {
        updateAddLikeCache(dispatch, data.postId, data.user);
        // getLikedPostDetails(post._id);
      }
    };
    const handleUnlikePost = (data: { postId: string; user: TUser }) => {
      if (data.postId === post._id) {
        updateUnlikeCache(dispatch, data.postId, data.user);
        // getLikedPostDetails(post._id);
      }
    };

    const handleNewNotification = (data: TNotification) => {
      if (data.postId === post._id) {
        // console.log(data.postId, "from the post component");
        refetchNotifications();
      }
    };

    socket.on("new-notification", handleNewNotification);
    socket.on("new-comment", handleNewComment);
    socket.on("delete-comment", handleDeleteComment);
    socket.on("like-post", handleLikePost);
    socket.on("unlike-post", handleUnlikePost);
    return () => {
      socket.off("new-comment", handleNewComment);
      socket.off("delete-comment", handleDeleteComment);
      socket.off("like-post", handleLikePost);
      socket.off("unlike-post", handleUnlikePost);
      socket.off("new-notification", handleNewNotification);
    };
  }, [socket, post._id, getLikedPostDetails, refetchNotifications, dispatch]);

  useEffect(() => {
    // Sync the optimistic state with the actual data once it loads
    setIsOptimisticLiked(isPostLiked);
  }, [isPostLiked]);

  // console.log(data,'form the post component');
  const handleDeletePost = async () => {
    try {
      await deletePost(post._id).unwrap();
      toast({
        description: "Post deleted successfully",
      });
    } catch (error) {
      console.log(error);
    }
  };
  const handleAddLike = async () => {
    setIsOptimisticLiked(!isOptimisticLiked);
    try {
      await addLike({ id: post._id }).unwrap();
    } catch (error) {
      console.log(error);
      setIsOptimisticLiked(isOptimisticLiked);
    }
  };

  const handleOpenLikeDialog = async (open: boolean) => {
    if (open) {
      dispatch(openDialog({ postId: post._id, dialogType: "likesDialog" }));
      await getLikedPostDetails(post._id);
    } else {
      dispatch(closeDialog({ postId: post._id, dialogType: "likesDialog" }));
    }
  };
  const handleOpenCommentDetailsDialog = async (open: boolean) => {
    if (open) {
      dispatch(
        openDialog({ postId: post._id, dialogType: "commentDetailsDialog" })
      );
      // await getPostComments(post._id);
    } else {
      dispatch(
        closeDialog({ postId: post._id, dialogType: "commentDetailsDialog" })
      );
    }
  };
  const handleCommentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCommentText(e.target.value);
  };
  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addComment({ text: commentText, postId: post._id }).unwrap();
      setOpenCommentDialog(false);
      dispatch(
        closeDialog({ postId: post._id, dialogType: "addCommentDialog" })
      );
      setCommentText("");
    } catch (error) {
      console.log(error);
    }
  };
  const handleOpenCommentDialog = (open: boolean) => {
    // setOpenCommentDialog(open);
    if (open) {
      dispatch(
        openDialog({ postId: post._id, dialogType: "addCommentDialog" })
      );
    } else {
      dispatch(
        closeDialog({ postId: post._id, dialogType: "addCommentDialog" })
      );
    }

    // if (!open) dispatch(closeDialog("comment"));
  };

  const handleEmojiClick = (emoji: any) => {
    setCommentText((prev) => prev + emoji.native);
  };
  const handleShowEmojiPicker = () => {
    setIsEmojiPickerOpen(true);
  };

  const handleEmojiPickerClose = () => {
    if (isEmojiPickerOpen) {
      setIsEmojiPickerOpen(false);
    }
  };

  useEffect(() => {
    getPostComments(post._id);
    getLikedPostDetails(post._id);
  }, [post._id, getPostComments, getLikedPostDetails]);
  // console.log({ data, post }, "post");
  // const handleUpdatePost = async()=>{}

  return (
    <div className={`${styles} shadow-lg rounded-xl p-6 bg-card`}>
      <PostHeader
        post={post}
        userId={data?._id}
        isLoading={isLoading}
        onDelete={handleDeletePost}
        isDeletingSuccess={isSuccess}
      />

      <div>
        <PostBody
          post={post}
          openLikeDialog={handleOpenLikeDialog}
          openCommentDetailsDialog={handleOpenCommentDetailsDialog}
          loadingComments={loadingComment}
          loadingLikedData={loadingLikedData}
          commentsData={commentsData}
          likedData={likedData}
        />
      </div>

      <div className="flex items-center gap-2 lg:gap-4  pt-3 justify-between text-card-foreground">
        <div
          className="flex items-center  gap-2  hover-color rounded-md px-2 py-1 lg:px-4 lg:py-2 cursor-pointer"
          onClick={handleAddLike}
        >
          <AiFillLike
            className={`${isOptimisticLiked && "fill-blue-800"} h-5`}
          />
          <p
            className={`${
              isOptimisticLiked && "text-blue-800 font-semibold"
            } h-5`}
          >
            like
          </p>
        </div>
        <Dialog onOpenChange={handleOpenCommentDialog} open={commentDialogOpen}>
          <DialogTrigger>
            <div className="flex items-center gap-2   hover-color rounded-md px-2 py-1 lg:px-4 lg:py-2 cursor-pointer">
              <FaRegCommentAlt className="h-5" />
              <p className="h-5">comment</p>
            </div>
          </DialogTrigger>
          <DialogContent aria-describedby={undefined}>
            <DialogHeader>
              <DialogTitle className="mb-4">Comments</DialogTitle>
              <form
                action=""
                className="flex flex-col gap-2 relative"
                onSubmit={handleAddComment}
              >
                <Textarea
                  className="resize-none px-3 py-2"
                  placeholder="Write a comment"
                  value={commentText}
                  onChange={handleCommentChange}
                  disabled={isLoadingComment}
                  maxLength={500}
                  autoFocus
                />
                <MdEmojiEmotions
                  onClick={handleShowEmojiPicker}
                  className="hidden md:block icon absolute right-2  text-2xl cursor-pointer "
                />
                <div
                  className={`hidden md:block absolute right-0 opacity-0 bottom-[50px] scale-0 ${
                    isEmojiPickerOpen ? "opacity-100 scale-100" : ""
                  } transition-opacity `}
                >
                  <Picker
                    data={emojiData}
                    onEmojiSelect={handleEmojiClick}
                    onClickOutside={handleEmojiPickerClose}
                    searchPosition={"none"}
                    skinTonePosition={"none"}
                  />
                </div>

                <Button
                  className="button"
                  type="submit"
                  disabled={isLoadingComment || !commentText}
                >
                  Comment
                </Button>
              </form>
            </DialogHeader>
          </DialogContent>
        </Dialog>
        <div className="flex items-center  gap-2    hover-color rounded-md px-2 py-1 lg:px-4 lg:py-2 cursor-pointer">
          <RiShareForwardLine className="h-5" />
          <p className="h-5">share</p>
        </div>
      </div>
    </div>
  );
};

export default Post;
