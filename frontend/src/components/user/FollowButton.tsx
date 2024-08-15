import { useGetMeQuery, useFollowUserMutation } from "@features/api/userSlice";
import { Button } from "@components/ui/button";
import { ImSpinner2 } from "react-icons/im";

const FollowButton = ({ id }: { id: string }) => {
  const { data: userLogin } = useGetMeQuery();
  const [followUser, { isLoading }] = useFollowUserMutation();

  const checkFollowing = userLogin?.following.find((user) => user._id === id);
  const handleFollowUser = async () => {
    try {
      const data = await followUser(id).unwrap();
      console.log(data);
    } catch (error) {
      console.log(error);
    }
  };
  console.log({ isLoading }, "from follow button");
  return (
    <div className={`${userLogin?._id === id ? "hidden" : "block"}`}>
      {checkFollowing ? (
        <Button
          className="button dark:bg-secondary flex gap-1 items-center  "
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
          className="button dark:bg-secondary flex gap-1 items-center "
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
