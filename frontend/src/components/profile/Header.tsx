import { useGetMeQuery, useGetUserProfileQuery } from "@features/api/userSlice";
import { Button } from "@components/ui/button";
const Header = ({ id }: { id: string }) => {
  // const { data } = useGetMeQuery()
  const { data } = useGetUserProfileQuery(id);

  return (
    <div className="flex justify-between items-center bg-card p-4 rounded">
      <div className="flex items-center gap-3">
        <Button>Follow</Button>
        <Button>Message</Button>
      </div>
      <div className="flex items-center gap-3">
        <div className="text">
          <h1>{data?.username}</h1>
          <p>{data?.followers.length} followers</p>
        </div>
        <img
          src={data?.profileImg}
          alt={data?.username}
          className="rounded-full w-[100px] h-[100px]"
        />
      </div>
    </div>
  );
};

export default Header;
