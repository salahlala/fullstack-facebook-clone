import { generateTokenAndSetCookie } from "../lib/generateToken.js";
import sendEmail from "../utils/email.js";
import User from "../models/userModel.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

// dotenv.config({ path: "./config.env" });

const USER_LIMIT = process.env.USER_LIMIT;

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Please enter all the fields" });
    }
    const userExists = await User.findOne({ email }).select("+password");

    if (!userExists) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    const isPasswordCorrect = await bcrypt.compare(
      password,
      userExists.password
    );

    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    const token = generateTokenAndSetCookie(userExists._id, res);
    userExists.password = undefined;
    res
      .status(200)
      .json({ message: "Login successful", data: userExists, token });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const checkExistUser = async (email, username) => {
  const existingUser = await User.findOne({ username });
  const existingEmail = await User.findOne({ email });

  if (existingUser) {
    throw new Error("Username already exists");
  }
  if (existingEmail) {
    throw new Error("Email already exists");
  }
};
export const signup = async (req, res) => {
  try {
    const userCount = await User.countDocuments();
    if (userCount >= USER_LIMIT) {
      return res.status(400).json({ message: "User limit reached" });
    }
    const { username, fullName, email, password } = req.body;

    if (!username || !fullName || !email || !password) {
      return res.status(400).json({ message: "Please enter all the fields" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email address" });
    }

    try {
      await checkExistUser(email, username, res);
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }

    if (password.length < 8) {
      return res
        .status(400)
        .json({ message: "Password should be at least 8 characters" });
    }
    // const salts = await bcrypt.genSalt(10);
    // const hashedPassword = await bcrypt.hash(password, salts);
    const newUser = await new User({
      username,
      fullName,
      email,
      password,
    });

    if (newUser) {
      // generateTokenAndSetCookie(newUser._id, res);
      await newUser.save();
      return res.status(201).json({
        _id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        fullName: newUser.fullName,
        followers: newUser.followers,
        following: newUser.following,
        profileImg: newUser.profileImg,
        bio: newUser.bio,
      });
    } else {
      return res.status(400).json({ message: "Invalid user data" });
    }
  } catch (error) {
    console.log("Error in signup controller", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const logout = async (req, res) => {
  try {
    // res.clearCookie("jwt");
    res.cookie("jwt", "", { maxAge: 0 });
    res.cookie("refreshToken", "", { maxAge: 0 });
    res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate("following", " username profileImg fullName bio followers")
      .populate("followers", " username profileImg fullName bio followers");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const refreshToken = async (req, res, next) => {
  const cookies = req.cookies;

  if (!cookies?.refreshToken) {
    return res.status(401).json({ message: "Token is missing" });
  }
  const refreshToken = cookies.refreshToken;
  try {
    const decode = jwt.verify(refreshToken, process.env.REFRESH_JWT_SECRET);
    console.log({ decode }, "decode");
    if (!decode) {
      return res.status(403).json({ message: "Invalid token" });
    }
    const user = await User.findById(decode.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (user.changePasswordAfter(decode.iat)) {
      return res
        .status(401)
        .json({ message: "User recently changed password" });
    }
    const accessToken = generateTokenAndSetCookie(user._id, res);
    res.status(200).json({ token: accessToken });
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Refresh token expired" });
    } else {
      return res.status(403).json({ message: "Invalid token" });
    }
  }
};

export const forgotPassword = async (req, res, next) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });
  const resetUrl = `${process.env.FRONTEND_URL}/${resetToken}`;
  const message = `If you didn't forget your password, please ignore this email!`;
  try {
    await sendEmail({
      email,
      subject: "Your password reset token (valid for 10 min)",
      message,
      resetUrl,
    }).then(() => {
      console.log({ email }, "email sent");
    });
    return res.status(200).json({ message: "Token sent to email" });
  } catch (error) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return next(error);
  }
};

export const resetPassword = async (req, res, next) => {
  const { password, passwordConfirm } = req.body;

  if (!password || !passwordConfirm) {
    return res
      .status(400)
      .json({ message: "Please provide password and confirm password" });
  }
  if (password !== passwordConfirm) {
    return res.status(400).json({ message: "Password does not match" });
  }
  try {
    const hashedToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });
    if (!user) {
      return res
        .status(400)
        .json({ message: "Token is invalid or has expired" });
    }
    user.password = password;
    user.passwordConfirm = passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: true });
    user.password = undefined;
    user.passwordConfirm = undefined;
    const accessToken = generateTokenAndSetCookie(user._id, res);
    res.status(200).json({ token: accessToken, user });
  } catch (error) {
    return next(error);
  }
};

// export const checkUserLogin = async (req, res, next) => {
//   try {
//     const token = req.cookies.jwt;
//     if (!token) {
//       return res.status(401).json({ message: "Unauthorized" });
//     }
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     const user = await User.findById(decoded.id);
//     if (!user) {
//       return res.status(401).json({ message: "Unauthorized" });
//     }
//     return res.status(200).json({ user });
//   } catch (error) {}
// };
