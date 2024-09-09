import { useState, useEffect } from "react";

import type { TComment, TPost } from "@typesFolder/postType";
import type { TNotification } from "@typesFolder/notificationType";
import type { TUser } from "@typesFolder/authType";

import { openDialog, closeDialog } from "@store/dialogUiSlice";
import { useAppDispatch, useAppSelector } from "@store/hooks";
import { useGetMeQuery } from "@features/api/userApiSlice";
import {
  useLazyGetLikedPostDetailsQuery,
  useLazyGetPostCommentsQuery,
  useGetPostCommentsQuery,
  useDeletePostMutation,
  useAddLikeMutation,
  useAddCommentMutation,
  postSlice,
} from "@features/api/postApiSlice";
import { useGetNotificationsQuery } from "@features/api/notificationApiSlice";

// cache
import {
  updateAddCommentCache,
  updateDeleteCommentCache,
  updateAddLikeCache,
  updateUnlikeCache,
} from "@utils/postsCache";

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

import { FaRegCommentAlt } from "react-icons/fa";
import { AiFillLike } from "react-icons/ai";
import { RiShareForwardLine } from "react-icons/ri";
import { useInView } from "react-intersection-observer";
import { apiSlice } from "@features/api/apiSlice";

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

  const dispatch = useAppDispatch();
  const dialogData = useAppSelector((state) => state.dialog[post._id]);
  const commentDialogOpen = dialogData?.addCommentDialog || false;
  const { socket } = useAppSelector((state) => state.socket);
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.5 });

  const [fetchedComments, setFetchedComments] = useState<Set<string>>(
    new Set()
  );
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
    try {
      await addLike({ id: post._id }).unwrap();
    } catch (error) {
      console.log(error);
    }
  };

  const handleOpenLikeDialog = async (open: boolean) => {
    if (open) {
      dispatch(openDialog({ postId: post._id, dialogType: "likesDialog" }));
      await getLikedPostDetails(post._id);
    } else {
      dispatch(closeDialog({ postId: post._id, dialogType: "likesDialog" }));
    }
    // if (!open) dispatch(closeDialog(post._id));
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

  // get post comments
  useEffect(() => {
    if (inView && !fetchedComments.has(post._id)) {
      getPostComments(post._id);
      getLikedPostDetails(post._id);
      setFetchedComments((prev) => new Set(prev).add(post._id));
    }
  }, [post, inView, getPostComments, getLikedPostDetails, fetchedComments]);

  // console.log({ data, post }, "post");
  // const handleUpdatePost = async()=>{}

  const likedPostsSet = new Set(data?.likedPosts?.map((id) => id.toString()));
  const isPostLiked = likedPostsSet.has(post._id.toString());
  return (
    <div className={`${styles} shadow-lg rounded-xl p-6 bg-card`} ref={ref}>
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
      {/* <PostHeader /> */}
      {/* <PostContent /> */}
      {/* <PostReactions /> */}
      <div className="flex items-center gap-2 lg:gap-4  pt-3 justify-between text-card-foreground">
        <div
          className="flex items-center  gap-2 transition duration-75 hover:bg-black/10 dark:hover:bg-white/10 rounded-md px-2 py-1 lg:px-4 lg:py-2 cursor-pointer"
          onClick={handleAddLike}
        >
          <AiFillLike className={`${isPostLiked && "fill-blue-800"} h-5`} />
          <p className={`${isPostLiked && "text-blue-800 font-semibold"} h-5`}>
            like
          </p>
        </div>
        <Dialog onOpenChange={handleOpenCommentDialog} open={commentDialogOpen}>
          <DialogTrigger>
            <div className="flex items-center gap-2 transition duration-75  hover:bg-black/10 dark:hover:bg-white/10 rounded-md px-2 py-1 lg:px-4 lg:py-2 cursor-pointer">
              <FaRegCommentAlt className="h-5" />
              <p className="h-5">comment</p>
            </div>
          </DialogTrigger>
          <DialogContent aria-describedby={undefined}>
            <DialogHeader>
              <DialogTitle className="mb-4">Comments</DialogTitle>
              <form
                action=""
                className="flex flex-col gap-2"
                onSubmit={handleAddComment}
              >
                <Textarea
                  className="resize-none "
                  placeholder="Write a comment"
                  value={commentText}
                  onChange={handleCommentChange}
                  disabled={isLoadingComment}
                  maxLength={500}
                  autoFocus
                />
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
        <div className="flex items-center  gap-2 transition duration-75  hover:bg-black/10 dark:hover:bg-white/10 rounded-md px-2 py-1 lg:px-4 lg:py-2 cursor-pointer">
          <RiShareForwardLine className="h-5" />
          <p className="h-5">share</p>
        </div>
      </div>
    </div>
  );
};

export default Post;
