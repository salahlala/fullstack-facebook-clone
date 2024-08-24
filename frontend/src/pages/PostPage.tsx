import { useParams } from "react-router";
import { useGetPostByIdQuery } from "@features/api/postSlice";
import Post from "@components/post/Post";

import type { ApiError } from "@typesFolder/apiError";

import { ImSpinner2 } from "react-icons/im";
const PostPage = () => {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, isError, error } = useGetPostByIdQuery(
    id as string,
    {
      refetchOnMountOrArgChange: true,
    }
  );

  return (
    <div className=" pt-[100px] grid place-content-center">
      {isLoading && <ImSpinner2 className="text-3xl animate-spin" />}
      {/* {!isLoading && !data && <div>Post not found</div>} */}
      {data && !isError && <Post post={data} styles="w-[500px]" />}

      {isError && (
        <div className="text-red-500 font-medium text-lg">
          {(error as ApiError).message}
        </div>
      )}
    </div>
  );
};

export default PostPage;
