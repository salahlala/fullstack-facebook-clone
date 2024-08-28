import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import ReactTimeAgo from "react-time-ago";
import { useAppSelector, useAppDispatch } from "@store/hooks";
import { openDialog, closeDialog } from "@store/uiSlice";

import { useDeletePostMutation } from "@features/api/postSlice";
// components
import PostEditorForm from "@components/post/PostEditorForm";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@components/ui/popover";
import { Button } from "@components/ui/button";
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
import { Avatar, AvatarFallback, AvatarImage } from "@components/ui/avatar";
import { useToast } from "@components/ui/use-toast";

// types
import { TPost } from "@typesFolder/postType";
// icons
import { BsThreeDots } from "react-icons/bs";
import { MdEdit } from "react-icons/md";
import { IoReload } from "react-icons/io5";
import { FaTrashAlt } from "react-icons/fa";
import { ImSpinner2 } from "react-icons/im";

interface PostHeaderProps {
  post: TPost;
  userId: string | undefined;
  isLoading: boolean;
  isDeletingSuccess: boolean;
  onDelete: () => void;
}

const PostHeader = ({
  post,
  userId,
  isLoading,
  onDelete,
  isDeletingSuccess,
}: PostHeaderProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [alertDialogOpen, setAlertDialogOpen] = useState(false);
  const [postId, setPostId] = useState("");
  const [oldText, setOldText] = useState("");
  const [oldImage, setOldImage] = useState("");

  const { isDialogOpen, type } = useAppSelector((state) => state.ui);
  const dispatch = useAppDispatch();
  const [deletePost, { isLoading: isLoadingDelete }] = useDeletePostMutation();
  const { toast } = useToast();

  // Check if the post has been updated
  const handleOpen = () => {
    setIsOpen(!isOpen);
  };

  // const handleOpenChange = (open: boolean) => {
  //   if (!isLoadingDelete) {
  //     setAlertDialogOpen(open);
  //   }
  // };
  useEffect(() => {
    if (isDeletingSuccess) {
      setIsOpen(false);
    }
  }, [isDeletingSuccess]);

  const handleEditClick = (post: TPost): void => {
    console.log(post, "from edit click");
    setPostId(post._id);
    setOldText(post.text || "");
    setOldImage(post.img?.url || "");
    dispatch(openDialog("edit"));
  };

  const handleDelete = async () => {
    try {
      await deletePost(post._id).unwrap();
      setAlertDialogOpen(false);
      setIsOpen(false);
      toast({
        description: "Post deleted successfully",
      });
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-3">
        <Link to={`/app/profile/${post.user._id}`}>
          <Avatar className="w-[60px] h-[60px]">
            <AvatarImage src={post.user.profileImg?.url || ""} />
            <AvatarFallback>
              {post.user.username?.slice(0, 1).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          {/* <img src="" alt="" className="" /> */}
        </Link>

        <div className="">
          <Link to={`/app/profile/${post.user._id}`}>
            <h2 className="font-bold text-xl text-card-foreground">
              {post.user.username}
            </h2>
          </Link>
          <p className="font-medium dark:text-white/60 text-black/60 text-sm">
            <ReactTimeAgo
              date={new Date(post?.createdAt || Date.now())}
              locale="en-US"
            />
          </p>
        </div>
      </div>

      {userId === post.user._id && (
        <>
          <Popover open={isOpen} onOpenChange={handleOpen}>
            <PopoverTrigger>
              <BsThreeDots className="dark:text-white/60" />
            </PopoverTrigger>
            <PopoverContent>
              <div className="flex flex-col gap-3">
                <div
                  onClick={() => handleEditClick(post)}
                  className={`${
                    isLoading && "pointer-events-none"
                  } flex gap-2 cursor-pointer items-center dark:hover:bg-white/10 hover:bg-black/10 p-2 rounded-md`}
                >
                  <MdEdit className="" />
                  <p>Edit</p>
                </div>

                {/* {isLoading && (
                  <Button disabled>
                    <ImSpinner2 className="mr-2 w-4 animate-spin" />
                    please wait
                  </Button>
                )} */}

                <AlertDialog open={alertDialogOpen}>
                  <AlertDialogTrigger onClick={() => setAlertDialogOpen(true)}>
                    <div
                      className={` flex gap-2 cursor-pointer items-center dark:hover:bg-white/10 hover:bg-black/10 p-2 rounded-md`}
                    >
                      <FaTrashAlt className="" />
                      <p>Delete</p>
                    </div>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="w-[calc(100%-40px)] md:w-full">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="font-bold">
                        Delete Post
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel
                        disabled={isLoadingDelete}
                        onClick={() => setAlertDialogOpen(false)}
                      >
                        Cancel
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDelete}
                        className="bg-red-500 hover:bg-red-600 text-white"
                        disabled={isLoadingDelete}
                      >
                        {isLoadingDelete ? (
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
          {isDialogOpen && postId && type === "edit" && (
            <PostEditorForm
              isDialogOpen={isDialogOpen}
              type="edit"
              postId={postId}
              title="Edit"
              oldText={oldText}
              oldImage={oldImage}
              setOldImage={setOldImage}
            />
          )}
        </>
      )}
    </div>
  );
};

export default PostHeader;
