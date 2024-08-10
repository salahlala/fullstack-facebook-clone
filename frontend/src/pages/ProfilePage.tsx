import { useParams } from "react-router-dom";
import Header from "@components/profile/Header";
import Post from "@components/post/Post";
import PostEditorForm from "@components/post/PostEditorForm";
import Loader from "@components/Loader";
import { Avatar, AvatarFallback, AvatarImage } from "@components/ui/avatar";

import { openDialog } from "@store/uiSlice";
import { useAppDispatch, useAppSelector } from "@store/hooks";

import {
  useGetUserPostsQuery,
  useGetMyPostsQuery,
} from "@features/api/postSlice";
import { useGetMeQuery } from "@features/api/userSlice";
const ProfilePage = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const { isDialogOpen, type } = useAppSelector((state) => state.ui);

  const { data: userLogin } = useGetMeQuery();
  const isMyProfile = userLogin?._id === id;
  const myPostsQuery = useGetMyPostsQuery(undefined, { skip: !isMyProfile });
  const userPostsQuery = useGetUserPostsQuery(id!, { skip: isMyProfile });

  const { data: posts, isLoading: postsLoading } = isMyProfile
    ? myPostsQuery
    : userPostsQuery;

  // console.log(posts, "posts");
  const handleOpenDialog = () => {
    dispatch(openDialog("create"));
  };
  return (
    <div className="min-h-screen pt-[70px] container mx-auto px-4">
      <Header id={id!} />
      <div className="flex gap-4 mt-3">
        <div className="basis-1/2  p-4 ">
          {isMyProfile && (
            <div className="flex items-center gap-2 p-4 shadow  rounded bg-card mb-3">
              <p
                className="bg-secondary cursor-pointer w-full py-2 px-3 rounded-full hover:bg-background duration-300 transition-colors"
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
          )}
          {postsLoading ? (
            <div>
              <Loader />
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {posts?.map((post, index) => (
                <Post key={index} post={post} />
              ))}
            </div>
          )}
        </div>
        <div className="friends-list"></div>
      </div>
      {isMyProfile && type === "create" && (
        <PostEditorForm
          isDialogOpen={isDialogOpen}
          type="create"
          title="Create"
        />
      )}
      {/* <CreatePost /> */}
    </div>
  );
};

export default ProfilePage;
