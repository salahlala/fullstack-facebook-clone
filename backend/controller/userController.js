import User from "../models/userModel.js";
import Notification from "../models/notificationModel.js";
import bcrypt from "bcryptjs";
import { v2 as cloudinary } from "cloudinary";
import path from "path";
import sharp from "sharp";
import { fileURLToPath } from "url";
import fs from "fs";
import {
  cloudinaryUploadImage,
  cloudinaryDeleteImage,
} from "../utils/cloudinary.js";

// Get the directory name of the current module file
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const userProfile = async (req, res) => {
  try {
    // const { username } = req.params;
    // const user = await User.findOne({ username });
    const { id } = req.params;
    const user = await User.findOne({ _id: id });

    if (!user) {
      return res.status(404).json({ message: "no user with this name" });
    }

    res.status(200).json({
      data: user,
    });
  } catch (error) {
    console.log(`error in user profile ${error}`);
    res.status(500).json({ error: "internal server error" });
  }
};

export const followUnfollowUser = async (req, res) => {
  try {
    const { id } = req.params;
    const currentUserID = req.user._id;
    const currentUser = await User.findById(currentUserID);
    const userToModify = await User.findById(id);
    if (id == currentUserID.toString()) {
      return res
        .status(400)
        .json({ error: "you can't follow/unfollow yourself" });
    }
    if (!currentUser || !userToModify) {
      return res.status(400).json({ error: "user not found" });
    }

    const isFollowing = currentUser.following?.includes(id);

    if (isFollowing) {
      // unfollow
      await User.findByIdAndUpdate(id, { $pull: { followers: currentUserID } });
      await User.findByIdAndUpdate(currentUserID, {
        $pull: { following: id },
      });

      res.status(200).json({ message: "user unfollowed" });
    } else {
      // follow
      await User.findByIdAndUpdate(id, {
        $push: { followers: currentUserID },
      });
      await User.findByIdAndUpdate(currentUserID, {
        $push: { following: id },
      });
      // notification
      const notification = new Notification({
        from: currentUserID,
        to: userToModify._id,
        type: "follow",
      });
      await notification.save();
      res.status(200).json({ message: "user followed" });
    }
  } catch (error) {
    console.log(`error in  followUnfollowUser ${error}`);
    res.status(500).json({ error: "internal server error" });
  }
};

export const getSuggestedUsers = async (req, res) => {
  try {
    const userId = req.user._id;

    const userFollowedBy = await User.findById(userId).select(following);

    const users = await User.aggregate([
      {
        $match: {
          _id: { $ne: userId },
        },
      },
      // return only 10 values
      {
        $sample: { size: 10 },
      },
    ]);
    // filter users not contains in the following array
    const filteredUser = users.filter((u) => !userFollowedBy.includes(u._id));

    const suggestedUser = filteredUser.slice(0, 4);

    res.status(200).json({ data: suggestedUser });
  } catch (error) {
    console.log(`error in  getSuggestedUsers ${error}`);
    res.status(500).json({ error: "internal server error" });
  }
};

export const updateUser = async (req, res) => {
  const { username, fullName, email, currentPassword, newPassword, bio } =
    req.body;
  let { coverImg } = req.body;
  const userId = req.user._id;
  let curPath;
  try {
    let user = await User.findById(userId).select("+password");
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }
    if (
      (!currentPassword && newPassword) ||
      (!newPassword && currentPassword)
    ) {
      return res.status(400).json({ message: "fill all fields" });
    }
    console.log({ currentPassword, newPassword });
    if (currentPassword && newPassword) {
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res
          .status(400)
          .json({ status: 400, message: "current password is not correct" });
      }
      if (newPassword.length < 8) {
        return res
          .status(400)
          .json({ status: 400, message: "password must be at least 8 char" });
      }

      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
    }
    if (req.file) {
      const imgPath = req.file.filename;
      curPath = path.join(__dirname, `../public/images/${imgPath}`);
      console.log(req.file, "from update user profile img");
      // if (user.profileImg) {
      //   await cloudinary.uploader.destroy(
      //     user.profileImg.split("/").pop().split(".")[0]
      //   );
      // }
      console.log(curPath);
      const upload = await cloudinaryUploadImage(curPath);
      const imgId = user.profileImg.public_id;
      if (imgId) {
        await cloudinaryDeleteImage(imgId);
      }
      user.profileImg = {
        public_id: upload?.public_id,
        url: upload?.secure_url,
      };
    }

    // if (coverImg) {
    //   if (user.coverImg) {
    //     await cloudinary.uploader.destroy(
    //       user.coverImg.split("/").pop().split(".")[0]
    //     );
    //   }
    //   const upload = await cloudinary.uploader.upload(coverImg);
    //   user.coverImg = upload.secure_url;
    // }

    user.fullName = fullName || user.fullName;
    user.bio = bio || user.bio;
    user.email = email || user.email;
    user.username = username || user.username;
    await user.save();
    user.password = undefined;
    return res.status(200).json(user);
  } catch (error) {
    console.log("Error in updateUser: ", error.message);
    res.status(500).json({ error: error.message });
  }

  if (curPath && fs.existsSync(curPath)) {
    // console.log("file deleted successfully");
    fs.unlinkSync(curPath);
  }
};
export const resizeUserPhoto = async (req, res, next) => {
  try {
    if (!req.file) return next();
    console.log(req.file, "req.file");

    req.file.filename = `user-${req.user._id}-${Date.now()}.jpeg`;
    console.log(req.file.filename, "req.file");

    if (!req.file.buffer || req.file.buffer.length === 0) {
      console.log("Empty file buffer");
      return next(new Error("Empty file buffer"));
    }
    await sharp(req.file.buffer)
      .resize(200, 200)
      .toFormat("jpeg")
      .jpeg({ quality: 80 })
      .toFile(path.join(__dirname, `../public/images/${req.file.filename}`));

    next();
  } catch (error) {
    console.log(error, "from resizePostPhoto");
    return res.status(500).json({ error: error.message });
  }
};
// export const updateUser = async (req, res) => {
//   const { username, fullName, email, currentPassword, newPassword, bio } =
//     req.body;
//   let { coverImg, profileImg } = req.body;
//   const userId = req.user_id;
//   try {
//     const user = await User.findById(userId).select("+password");
//     if (!user) {
//       return res.status(400).json({ error: "no user found with that id" });
//     }

//     if (
//       (!currentPassword && newPassword) ||
//       (currentPassword && !newPassword)
//     ) {
//       return res.status(400).json({ error: "please fill both fields" });
//     }
//     if (newPassword.length < 8) {
//       return res.status(400).json({ error: "the must be >= 8 chars" });
//     }
//     if (currentPassword && newPassword) {
//       const isMatch = await bcrypt.compare(currentPassword, user.password);
//       if (!isMatch) {
//         return res.status(400).json({ error: "the password aren't same" });
//       }
//       const salt = await bcrypt.genSalt(10);
//       const hashed = await bcrypt.hash(newPassword, salt);
//       user.password = hashed;
//     }

//     if (profileImg) {
//       if (user.profileImg) {
//         await cloudinary.uploader.destroy(
//           user.coverImg.split("/").pop().split(".")[0]
//         );
//       }
//       const uploader = await cloudinary.uploader.upload(profileImg);
//       user.profileImg = uploader.secure_url;
//     }

//     if (coverImg) {
//       if (user.coverImg) {
//         await cloudinary.uploader.destroy(
//           user.coverImg.split("/").pop().split(".")[0]
//         );
//       }
//       const uploader = await cloudinary.uploader.upload(coverImg);
//       user.coverImg = uploader.secure_url;
//     }

//     user.fullName = fullName || user.fullName;
//     user.bio = bio || user.bio;
//     user.email = email || user.email;
//     user.username = username || user.username;

//     await user.save();

//     return res.status(200).json({ data: user });
//   } catch (error) {}
// };
