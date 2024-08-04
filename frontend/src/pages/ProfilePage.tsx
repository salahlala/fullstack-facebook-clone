import { useParams } from "react-router-dom";
import Header from "@components/profile/Header";
import CreatePost from "@components/post/CreatePost";
import Post from "@components/post/Post";

import { openDialog } from "@store/uiSlice";
import { useAppDispatch } from "@store/hooks";

import {
  useGetUserPostsQuery,
  useGetMyPostsQuery,
} from "@features/api/postSlice";
import { useGetMeQuery } from "@features/api/userSlice";
const ProfilePage = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const { data: userLogin } = useGetMeQuery();
  const isMyProfile = userLogin?._id === id;
  const myPostsQuery = useGetMyPostsQuery(undefined, { skip: !isMyProfile });
  const userPostsQuery = useGetUserPostsQuery(id!, { skip: isMyProfile });

  const { data: posts, isLoading: postsLoading } = isMyProfile
    ? myPostsQuery
    : userPostsQuery;

  // console.log(posts, "posts");
  const handleOpenDialog = () => {
    dispatch(openDialog());
  };
  return (
    <div className="min-h-screen pt-[70px] container mx-auto px-4">
      <Header id={id!} />
      <div className="flex gap-4 mt-3">
        <div className="basis-1/2  p-4 ">
          <div className="flex items-center gap-2 p-4 shadow  rounded bg-card mb-3">
            <p
              className="bg-secondary cursor-pointer w-full py-2 px-3 rounded-full hover:bg-background duration-300 transition-colors"
              onClick={handleOpenDialog}
            >
              Write a post
            </p>
            <img src="" alt="" className="w-[30px] h-[30px] rounded-full" />
          </div>

          {postsLoading ? (
            <div>Loading...</div>
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
      <CreatePost />
    </div>
  );
};

export default ProfilePage;
