import express from "express";
import {
  followUnfollowUser,
  getSuggestedUsers,
  updateUser,
  userProfile,
} from "../controller/userController.js";
import { protectRoute } from "../middleware/protectRoute.js";

const router = express.Router();

router.use(protectRoute);
router.get("/profile/:id", userProfile);
router.post("/follow/:id", followUnfollowUser);
router.get("/suggested", getSuggestedUsers);
router.post("/updateUser", updateUser);

export default router;
