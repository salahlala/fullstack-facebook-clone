import express from "express";
import {
  login,
  signup,
  logout,
  getMe,
  refreshToken,
  forgotPassword,
  resetPassword,
} from "../controller/authController.js";
import { protectRoute } from "../middleware/protectRoute.js";
const router = express.Router();
router.get("/me", protectRoute, getMe);
router.get("/refreshToken", refreshToken);
// router.get('/checkUser')
router.post("/login", login);
router.post("/signup", signup);
router.post("/logout", logout);

router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);
export default router;
