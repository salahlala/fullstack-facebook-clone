import { useLocation } from "react-router";

import PostEditorForm from "@components/post/PostEditorForm";
import { Avatar, AvatarFallback, AvatarImage } from "@components/ui/avatar";

import { useAppDispatch, useAppSelector } from "@store/hooks";
import { openDialog } from "@store/uiSlice";
import { useGetMeQuery } from "@features/api/userApiSlice";
const CreatePost = ({ id }: { id?: string }) => {
  const dispatch = useAppDispatch();
  const { pathname } = useLocation();
  const { isDialogOpen, type } = useAppSelector((state) => state.ui);
  const { data: userLogin } = useGetMeQuery();
  const isMyProfile = userLogin?._id === id;
  const handleOpenDialog = () => {
    dispatch(openDialog("create"));
  };
  return (
    <>
      <div className="flex items-center gap-2 p-4 shadow  rounded bg-card mb-3">
        <p
          className="bg-secondary cursor-pointer w-full py-2 px-4 rounded-full hover-color"
          onClick={handleOpenDialog}
        >
          Write a post
        </p>
        <Avatar>
          <AvatarImage src={userLogin?.profileImg?.url || ""} />
          <AvatarFallback>
            {userLogin?.username?.slice(0, 1).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      </div>
      {!pathname.includes("/profile") && type === "create" && (
        <PostEditorForm
          isDialogOpen={isDialogOpen}
          type={type}
          title="Create"
        />
      )}
      {isMyProfile && type === "create" && (
        <PostEditorForm
          isDialogOpen={isDialogOpen}
          type={type}
          title="Create"
        />
      )}
    </>
  );
};

export default CreatePost;
