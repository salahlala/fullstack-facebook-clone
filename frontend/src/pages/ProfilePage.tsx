import { useParams } from "react-router-dom";

import {
  useGetUserPostsQuery,
  useGetMyPostsQuery,
} from "@features/api/postSlice";
import { useGetMeQuery, useGetUserProfileQuery } from "@features/api/userSlice";

import CreatePost from "@components/post/CreatePost";
import Header from "@components/profile/Header";
import Post from "@components/post/Post";
import Loader from "@components/Loader";
import FriendList from "@components/user/FriendList";
const ProfilePage = () => {
  const { id } = useParams<{ id: string }>();

  const { data: userLogin } = useGetMeQuery();
  const isMyProfile = userLogin?._id === id;
  const myPostsQuery = useGetMyPostsQuery(undefined, { skip: !isMyProfile });
  const userPostsQuery = useGetUserPostsQuery(id!, { skip: isMyProfile });
  const { data: userProfile } = useGetUserProfileQuery(id!, {
    skip: isMyProfile,
  });
  const { data: posts, isLoading: postsLoading } = isMyProfile
    ? myPostsQuery
    : userPostsQuery;

  return (
    <div className="min-h-screen pt-[70px] container mx-auto px-4">
      <Header id={id!} />
      <div className="flex-col md:flex-row flex gap-4 mt-3">
        <div className="basis-1/2 ">
          {isMyProfile && <CreatePost id={id} />}
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
        <div className="friends-list basis-1/2 bg-card rounded-md ">
          <div className="p-4">
            <h1 className="text-2xl font-bold">Followers</h1>
            {/* length of friends */}
            <span className=" text-gray-500">30 Followers</span>
            {/* {isMyProfile &&
              userLogin?.followers?.map((user) => (
                <FriendList key={user._id} user={user} />
              ))}
            {userProfile?.followers?.map((user) => (
              <FriendList key={user._id} user={user} />
            ))} */}
          </div>
        </div>
      </div>
      {/* {isMyProfile && type === "create" && (
        <PostEditorForm
          isDialogOpen={isDialogOpen}
          type="create"
          title="Create"
        />
      )} */}
      {/* <CreatePost /> */}
    </div>
  );
};

export default ProfilePage;
