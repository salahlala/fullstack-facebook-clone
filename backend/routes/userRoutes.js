import express from "express";
import {
  followUnfollowUser,
  getSuggestedUsers,
  updateUser,
  userProfile,
  resizeUserPhoto,
  findUsersByQuery,
} from "../controller/userController.js";
import { protectRoute } from "../middleware/protectRoute.js";
import upload from "../utils/multerConfig.js";

const router = express.Router();

router.use(protectRoute);
router.get("/profile/:id", userProfile);
router.post("/follow/:id", followUnfollowUser);
router.get("/suggested", getSuggestedUsers);
router.get("/search-users", findUsersByQuery);
router.patch(
  "/updateUser",
  upload.single("profileImg"),
  resizeUserPhoto,
  updateUser
);

export default router;
