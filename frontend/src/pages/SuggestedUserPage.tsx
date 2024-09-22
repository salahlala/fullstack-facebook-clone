import { Link } from "react-router-dom";

import FollowButton from "@components/user/FollowButton";
import CardHover from "@components/user/CardHover";

import type { TUser } from "@typesFolder/authType";

import { useGetSuggestedUsersQuery } from "@features/api/userApiSlice";

import { ImSpinner2 } from "react-icons/im";

const SuggestedUserPage = () => {
  const { data, isLoading } = useGetSuggestedUsersQuery();
  return (
    <div className="container mx-auto px-4 pt-[75px]">
      <h1 className="text-3xl font-bold my-2">Suggested Users</h1>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4  ">
        {data?.map((user: TUser) => (
          <div className="p-3 " key={user._id}>
            <div className="w-full mb-2 h-[150px] md:h-[200px] bg-secondary rounded-md">
              <Link to={`/app/profile/${user._id}`}>
                <img
                  src={user.profileImg?.url}
                  className="w-full h-full rounded-md"
                  alt={user.username}
                />
              </Link>
            </div>

            <CardHover user={user} />

            <FollowButton id={user._id} />
          </div>
          // <FriendList key={user._id} user={user} type="follow" column={true} />
        ))}
        {!isLoading && data?.length === 0 && <p>No users found</p>}
        {isLoading && (
          <ImSpinner2 className="text-center text-2xl animate-spin " />
        )}
      </div>
    </div>
  );
};

export default SuggestedUserPage;
