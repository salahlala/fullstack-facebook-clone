import { postSlice } from "@features/api/postApiSlice";
import { AppDispatch } from "@store/index";
import type { TUser } from "@typesFolder/authType";
import type { TPost, TComment } from "@typesFolder/postType";
export const updatePostDeleteCache = (
  dispatch: AppDispatch,
  postId: string,
  limit: number
) => {
  dispatch(
    postSlice.util.updateQueryData(
      "getFollowingPosts",
      { limit },
      (draft: { posts: TPost[] }) => {
        draft.posts = draft.posts.filter((post) => post._id !== postId);
      }
    )
  );
};

export const updatePostUpdateCache = (
  dispatch: AppDispatch,
  updatedPost: TPost,
  limit: number
) => {
  dispatch(
    postSlice.util.updateQueryData(
      "getFollowingPosts",
      { limit },
      (draft: { posts: TPost[] }) => {
        const index = draft.posts.findIndex(
          (post) => post._id === updatedPost._id
        );
        if (index !== -1) {
          draft.posts[index] = updatedPost;
        }
      }
    )
  );
};

export const updateNewPostCache = (
  dispatch: AppDispatch,
  data: TPost,
  limit: number
) => {
  dispatch(
    postSlice.util.updateQueryData(
      "getFollowingPosts",
      { limit },
      (draft: { posts: TPost[] }) => {
        draft.posts.unshift(data);
      }
    )
  );
};

export const updateAddCommentCache = (
  dispatch: AppDispatch,
  postId: string,
  data: TComment
) => {
  dispatch(
    postSlice.util.updateQueryData(
      "getPostComments",
      postId,
      (draft: TComment[]) => {
        draft.unshift(data);
      }
    )
  );
};

export const updateDeleteCommentCache = (
  dispatch: AppDispatch,
  postId: string,
  commentId: string
) => {
  dispatch(
    postSlice.util.updateQueryData(
      "getPostComments",
      postId,
      (draft: TComment[]) => {
        return draft.filter((comment) => comment._id.toString() !== commentId);
      }
    )
  );
};

export const updateAddLikeCache = (
  dispatch: AppDispatch,
  postId: string,
  data: TUser
) => {
  dispatch(
    postSlice.util.updateQueryData(
      "getLikedPostDetails",
      postId,
      (draft: TUser[]) => {
        draft.unshift(data);
      }
    )
  );
};

export const updateUnlikeCache = (
  dispatch: AppDispatch,
  postId: string,
  data: TUser
) => {
  dispatch(
    postSlice.util.updateQueryData(
      "getLikedPostDetails",
      postId,
      (draft: TUser[]) => {
        return draft.filter(
          (user) => user._id.toString() !== data._id.toString()
        );
      }
    )
  );
};
