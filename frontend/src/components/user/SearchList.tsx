import { Link } from "react-router-dom";

import { Avatar, AvatarFallback, AvatarImage } from "@components/ui/avatar";

import type { TUser } from "@typesFolder/authType";

import { ImSpinner2 } from "react-icons/im";

interface SearchListProps {
  users: TUser[] | undefined;
  isSearchLoading: boolean;
}
const SearchList = ({ users, isSearchLoading }: SearchListProps) => {
  return (
    <>
      {users?.map((user) => (
        <Link
          to={`/app/profile/${user._id}`}
          key={user._id}
          className="flex items-center gap-3 mb-3 cursor-pointer transition hover:bg-black/10 dark:hover:bg-white/10 p-3 rounded-md"
        >
          <Avatar className="w-10 h-10">
            <AvatarImage src={user.profileImg.url} />
            <AvatarFallback>
              {user.username.slice(0, 1).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="capitalize text-lg">{user.username}</p>
            <span className="text-sm text-gray-400">{user.fullName}</span>
          </div>
        </Link>
      ))}
      {users?.length === 0 && !isSearchLoading && <p>No result found</p>}
      {isSearchLoading && (
        <div className="flex justify-center items-center">
          <ImSpinner2 className="text-center text-2xl animate-spin" />
        </div>
      )}
    </>
  );
};

export default SearchList;
