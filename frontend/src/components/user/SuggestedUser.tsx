import { useGetSuggestedUsersQuery } from "@features/api/userSlice";

import type { TUser } from "@typesFolder/authType";

import FriendList from "@components/user/FriendList";
import { ImSpinner2 } from "react-icons/im";
const SuggestedUser = () => {
  const { data: suggestedUser, isLoading: suggestedUserLoading } =
    useGetSuggestedUsersQuery();
  return (
    <div className=" card-scroll">
      <h2 className="font-bold p-4  text-2xl mb-1 text-primary sticky top-0 bg-card z-20">
        suggested User
      </h2>
      <div className="flex-col flex gap-4 p-4">
        {suggestedUser?.map((user: TUser) => (
          <FriendList key={user._id} user={user} type="follow" />
        ))}
        {!suggestedUserLoading && suggestedUser?.length === 0 && (
          <p>No users found</p>
        )}
        {suggestedUserLoading && (
          <ImSpinner2 className="text-center text-2xl animate-spin" />
        )}
      </div>
    </div>
  );
};

export default SuggestedUser;
