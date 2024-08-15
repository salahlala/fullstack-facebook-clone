import express from "express";
import { protectRoute } from "../middleware/protectRoute.js";
import {
  commentOnPost,
  createPost,
  deletePost,
  getAllPosts,
  likeUnlikePost,
  updatePost,
  resizePostPhoto,
  getLikedPosts,
  getFollowingPosts,
  getUserPosts,
  getMyPosts,
  getUserPostsWithId,
  getLikedPostDetails,
  getPostComments,
  deleteComment,
} from "../controller/postController.js";
import upload from "../utils/multerConfig.js";
const router = express.Router();

router.use(protectRoute);
// create post
// router.post("/create", uploadImg, createPost);
router.post("/", upload.single("img"), resizePostPhoto, createPost);
// comment on post
router.post("/comment/:id", commentOnPost);
// delete post
router.delete("/:id", deletePost);
// like post
router.post("/like/:id", likeUnlikePost);
// get all posts
// remove the duplicate routes '/'
router.get("/", getAllPosts);
// update post
router.patch("/:id", upload.single("img"), resizePostPhoto, updatePost);

// get like post of the user
router.get("/like/:id", getLikedPosts);
router.get("/like/detail/:id", getLikedPostDetails);

// get comment post of the user
router.get("/comments/:id", getPostComments);
// get following post
router.get("/following", getFollowingPosts);
// get posts of the user by the username
router.get("/user/username/:username", getUserPosts);
// get posts of the user by the ID
router.get("/user/id/:userId", getUserPostsWithId);

// get my posts
router.get("/me", getMyPosts);

// delete comment
router.delete("/comment/:postId/:commentId", deleteComment);
export default router;
