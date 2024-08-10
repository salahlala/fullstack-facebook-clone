// import PostReactions from "./PostReactions";
import PostHeader from "@components/post/PostHeader";
import PostBody from "@components/post/PostBody";
import { useState } from "react";

import { TPost } from "@typesFolder/postType";

import { useGetMeQuery } from "@features/api/userSlice";
import {
  useLazyGetLikedPostDetailsQuery,
  useLazyGetPostCommentsQuery,
  useGetPostCommentsQuery,
  useDeletePostMutation,
  useAddLikeMutation,
  useAddCommentMutation,
} from "@features/api/postSlice";

import { Button } from "@components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@components/ui/dialog";
import { Textarea } from "@components/ui/textarea";

import { FaRegCommentAlt } from "react-icons/fa";

import { AiFillLike } from "react-icons/ai";
import { RiShareForwardLine } from "react-icons/ri";
interface postProps {
  post: TPost;
}
const Post = ({ post }: postProps) => {
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
  const [commentText, setCommentText] = useState("");
  const [openCommentDialog, setOpenCommentDialog] = useState(false);
  // console.log(data,'form the post component');
  const handleDeletePost = async () => {
    try {
      await deletePost(post._id).unwrap();
      console.log("deleted");
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
    if (open) await getLikedPostDetails(post._id);
  };
  const handleOpenCommentDetailsDialog = async (open: boolean) => {
    if (open) await getPostComments(post._id);
  };
  const handleCommentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCommentText(e.target.value);
    console.log(e.target.value, "comment text");
  };
  const handleAddComment = async () => {
    console.log(post, "post");
    try {
      await addComment({ text: commentText, postId: post._id }).unwrap();
      setOpenCommentDialog(false);
      setCommentText("");
    } catch (error) {
      console.log(error);
    }
  };
  const handleOpenCommentDialog = (open: boolean) => {
    setOpenCommentDialog(open);
  };

  // const handleUpdatePost = async()=>{}
  return (
    <div className=" shadow-lg rounded-xl p-6 bg-card">
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
          <AiFillLike
            className={`${
              data?.likedPosts?.includes(post._id) && "fill-blue-500"
            } h-5`}
          />
          <p
            className={`${
              data?.likedPosts?.includes(post._id) && "text-blue-500"
            } h-5`}
          >
            like
          </p>
        </div>
        <Dialog onOpenChange={handleOpenCommentDialog} open={openCommentDialog}>
          <DialogTrigger>
            <div className="flex items-center gap-2 transition duration-75  hover:bg-black/10 dark:hover:bg-white/10 rounded-md px-2 py-1 lg:px-4 lg:py-2 cursor-pointer">
              <FaRegCommentAlt className="h-5" />
              <p className="h-5">comment</p>
            </div>
          </DialogTrigger>
          <DialogContent aria-describedby={undefined}>
            <DialogHeader>
              <DialogTitle className="mb-4">Comments</DialogTitle>

              <Textarea
                className="resize-none "
                placeholder="Write a comment"
                value={commentText}
                onChange={handleCommentChange}
                disabled={isLoadingComment}
              />
              <Button
                className="!mt-4 shadow-md transition bg-primary text-white hover:bg-card hover:text-black dark:bg-card dark:text-white dark:hover:bg-primary dark:hover:text-black "
                onClick={handleAddComment}
                disabled={isLoadingComment}
              >
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
    </div>
  );
};

export default Post;
