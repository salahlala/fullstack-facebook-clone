import {
  useGetMeQuery,
  useFollowUserMutation,
} from "@features/api/userApiSlice";
import { updateNewPostCache } from "@utils/postsCache";
import { useAppDispatch } from "@store/hooks";

import { Button } from "@components/ui/button";
import { ImSpinner2 } from "react-icons/im";

const FollowButton = ({ id }: { id: string }) => {
  const { data: userLogin } = useGetMeQuery();
  const [followUser, { isLoading }] = useFollowUserMutation();
  const dispatch = useAppDispatch();
  const checkFollowing = userLogin?.following.find((user) => user._id === id);
  const limit = localStorage.getItem("limit") || 10;
  const handleFollowUser = async () => {
    try {
      const data = await followUser(id).unwrap();
      data.data.forEach((post) => {
        updateNewPostCache(dispatch, post, Number(limit));
      });
      console.log(data.data, "from follow");
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <div className={`${userLogin?._id === id ? "hidden" : "block"} `}>
      {checkFollowing ? (
        <Button
          className="button  flex gap-1 items-center  "
          onClick={handleFollowUser}
          disabled={isLoading}
        >
          {isLoading && (
            <ImSpinner2 className="text-center text-2xl animate-spin" />
          )}
          Unfollow
        </Button>
      ) : (
        <Button
          className="button  flex gap-1 items-center "
          onClick={handleFollowUser}
          disabled={isLoading}
        >
          {isLoading && (
            <ImSpinner2 className="text-center text-2xl animate-spin" />
          )}
          Follow
        </Button>
      )}
    </div>
  );
};

export default FollowButton;
