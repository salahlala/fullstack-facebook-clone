import express from "express";
import {
  login,
  signup,
  logout,
  getMe,
  refreshToken,
} from "../controller/authController.js";
import { protectRoute } from "../middleware/protectRoute.js";
const router = express.Router();
router.get("/me", protectRoute, getMe);
router.get("/refreshToken", refreshToken);
// router.get('/checkUser')
router.post("/login", login);
router.post("/signup", signup);
router.post("/logout", logout);

export default router;
