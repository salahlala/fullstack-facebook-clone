import { useParams } from "react-router";
import { useGetPostByIdQuery } from "@features/api/postSlice";
import Post from "@components/post/Post";

import { ImSpinner } from "react-icons/im";
const PostPage = () => {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading } = useGetPostByIdQuery(id || "");

  return (
    <div className=" pt-[100px] grid place-content-center">
      {isLoading && <ImSpinner className="text-3xl animate-spin" />}
      {!isLoading && !data && <div>Post not found</div>}
      {data && <Post post={data} styles="w-[500px]" />}
    </div>
  );
};

export default PostPage;
