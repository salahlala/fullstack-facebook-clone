import Notification from "../models/notificationModel.js";
import Post from "../models/postModel.js";
import User from "../models/userModel.js";
import multer from "multer";
import path from "path";
import fs from "fs";
import sharp from "sharp";
import { fileURLToPath } from "url";
import busboy from "busboy";
import { v2 as cloudinary } from "cloudinary";

import { userMap } from "../socket/socket.js";

import {
  cloudinaryUploadImage,
  cloudinaryDeleteImage,
} from "../utils/cloudinary.js";

import { getIO } from "../socket/socket.js";

import mongoose from "mongoose";
// Get the directory name of the current module file
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// export const uploadImg = upload.single("img");

// Middleware to handle multer errors
export const errorHandler = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    // Handle Multer error
    res.status(400).send(err.message);
  } else {
    // Handle other errors
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
};

export const resizePostPhoto = async (req, res, next) => {
  try {
    if (!req.file) return next();
    console.log(req.file, "req.file");

    req.file.filename = `post-${req.user._id}-${Date.now()}.jpeg`;
    console.log(req.file.filename, "req.file");

    if (!req.file.buffer || req.file.buffer.length === 0) {
      console.log("Empty file buffer");
      return next(new Error("Empty file buffer"));
    }
    await sharp(req.file.buffer)
      .resize(1080, 1080)
      .toFormat("jpeg")
      .jpeg({ quality: 80 })
      .toFile(path.join(__dirname, `../public/images/${req.file.filename}`));

    next();
  } catch (error) {
    console.log(error, "from resizePostPhoto");
    return res.status(500).json({ error: error.message });
  }
};

export const createPost = async (req, res) => {
  const { text } = req.body;

  let img;
  let curPath;
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);
    const io = getIO();
    if (!user) {
      return res.status(400).json({ error: "user not found" });
    }
    if (!text && !req.file) {
      return res.status(400).json({ error: "post cannot be empty" });
    }

    if (req.file) {
      let imgPath = req.file.filename;
      curPath = path.join(__dirname, `../public/images/${imgPath}`);
      console.log(req.file.filename, "req.file");
      console.log(req.file, "create p os t controller");
      const result = await cloudinaryUploadImage(curPath);
      console.log(result, "result cloudinary");
      img = {
        public_id: result.public_id,
        url: result.secure_url,
      };
    }

    const post = await Post.create({
      user: userId,
      text,
      img,
    });
    io.emit("create-post", { postId: post._id, userId });
    res.status(201).json({ post });
  } catch (error) {
    console.log({ error: error }, "from create post");
    res.status(500).json({ error: "Internal Server Error" });
  }

  if (curPath && fs.existsSync(curPath)) {
    // console.log("file deleted successfully");
    fs.unlinkSync(curPath);
  }
};
export const deletePost = async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;
  try {
    const post = await Post.findById(id);
    const io = getIO();
    if (!post) {
      return res.status(400).json({ error: "post not found" });
    }

    if (post.user.toString() !== userId.toString()) {
      return res.status(401).json({ error: "unauthorized" });
    }
    const imgId = post.img?.public_id;
    if (imgId) {
      const deleteResutl = await cloudinaryDeleteImage(imgId);
      console.log(deleteResutl);
    }
    await Post.findByIdAndDelete(id);
    io.emit("delete-post", { postId: id, userId });
    res.status(200).json({ message: "post deleted" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const commentOnPost = async (req, res) => {
  try {
    const { text } = req.body;
    const { id } = req.params;
    const userId = req.user._id;
    const io = getIO();

    if (!text) {
      return res.status(400).json({ error: "text field is required" });
    }
    const post = await Post.findById(id);
    if (!post) {
      return res.status(400).json({ error: "post not found" });
    }

    const comment = {
      text,
      user: userId,
    };
    post.comments.push(comment);
    await post.save();
    if (post.user.toString() !== userId.toString()) {
      const notification = new Notification({
        from: userId,
        to: post.user,
        type: "comment",
        postId: id,
      });
      console.log(post.user.toString(), "post.user");
      await notification.save();
      const socketId = userMap.get(post.user.toString());
      console.log(notification);
      if (socketId) {
        io.to(socketId).emit("new-notification", notification);
      }

      // const io = getIO();
      io.emit("new-comment", { postId: id, userId });
    }
    res.status(200).json({ post });
  } catch (error) {
    console.log(error);
  }
};

export const likeUnlikePost = async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;
  const io = getIO();
  try {
    const post = await Post.findById(id);
    if (!post) {
      return res.status(400).json({ error: "post not found" });
    }

    const isLiked = post.likes.includes(userId);

    const notificationSent = await Notification.exists({
      from: userId,
      to: post.user,
      type: "like",
      postId: id,
    });
    if (isLiked) {
      await Post.updateOne({ _id: id }, { $pull: { likes: userId } });
      await User.updateOne({ _id: userId }, { $pull: { likedPosts: id } });

      io.emit("unlike-post", { postId: id, userId });
      return res.status(200).json({ message: "unliked successfully" });
    } else {
      post.likes.push(userId);
      await User.updateOne({ _id: userId }, { $push: { likedPosts: id } });

      await post.save();
      if (post.user.toString() !== userId.toString()) {
        if (!notificationSent) {
          const notification = new Notification({
            from: userId,
            to: post.user,
            type: "like",
            postId: id,
          });

          await notification.save();
          const socketId = userMap.get(post.user.toString());
          if (socketId) {
            io.to(socketId).emit("new-notification", notification);
          }
        }
      }

      // io.to(userId).emit("new-notification", { notification });
      io.emit("like-post", { postId: id, userId });
      return res.status(200).json({ message: "liked successfully" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("user")
      .populate("comments.user")
      .populate("likes", "_id username profileImg")
      .sort({ createdAt: -1 });

    res.status(200).json({ data: posts });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const updatePost = async (req, res) => {
  const { id } = req.params;
  const { text, removeImg } = req.body;
  let curPath;

  try {
    const post = await Post.findById(id);
    const userId = req.user._id;
    const io = getIO();
    if (!post) {
      return res.status(400).json({ error: "post not found" });
    }
    if (post.user.toString() !== userId.toString()) {
      return res.status(401).json({ error: "unauthorized" });
    }
    if (removeImg) {
      const imgId = post.img?.public_id;
      if (imgId) {
        await cloudinaryDeleteImage(imgId);
        post.img = null;
      }
    } else if (req.file) {
      let imgPath = req.file.filename;
      console.log(req.file, "from update image");
      curPath = path.join(__dirname, `../public/images/${imgPath}`);
      const result = await cloudinaryUploadImage(curPath);
      // console.log(result, "result filename");
      const imgId = post.img?.public_id;
      if (imgId) {
        await cloudinaryDeleteImage(imgId);
      }
      post.img = {
        public_id: result?.public_id,
        url: result?.secure_url,
      };
    }

    if (text) {
      post.text = text;
    }

    await post.save();
    io.emit("update-post", { postId: id, userId });
    res.status(200).json({ post });
  } catch (error) {
    console.log({ error }, "from update post");
    res.status(500).json({ error: "Internal Server Error" });
  }
  if (curPath && fs.existsSync(curPath)) {
    fs.unlinkSync(curPath);
  }
};

export const getLikedPosts = async (req, res) => {
  const userId = req.params.id;
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(400).json({ error: "user not found" });
    }
    const likedPosts = await Post.find({ _id: { $in: user.likedPosts } })
      .populate("user", "username profileImg")
      .populate("comments.user", "username profileImg");
    res.status(200).json({ likedPosts });
  } catch (error) {
    console.log(error, "from get liked posts");
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getFollowingPosts = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(400).json({ error: "user not found" });
    }
    const following = user.following;
    const posts = await Post.find({
      $or: [{ user: { $in: following } }, { user: userId }],
    })
      .sort({ createdAt: -1 })
      .populate("user", "username profileImg")
      .populate("likes", " username profileImg")
      .populate("comments.user", "username profileImg");
    res.status(200).json({ data: posts });
  } catch (error) {
    console.log(error, "from get following posts");
  }
};

export const getUserPosts = async (req, res) => {
  try {
    const { username } = req.params;
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ error: "user not found" });
    }
    const posts = await Post.find({ user: user._id })
      .sort({ createdAt: -1 })
      .populate("user", "username profileImg")
      .populate("likes", "_id username profileImg")

      .populate("comments.user", "username profileImg");

    res.status(200).json({
      data: {
        length: posts?.length,
        posts,
      },
    });
  } catch (error) {
    console.log(error, "from get user posts");
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getUserPostsWithId = async (req, res) => {
  try {
    const { userId } = req.params;
    const posts = await Post.find({ user: userId })
      .sort({ createdAt: -1 })
      .populate("user", "username profileImg")
      .populate("likes", "_id username profileImg")

      .populate("comments.user", "username profileImg");
    res.status(200).json({ data: posts });
  } catch (error) {
    console.log(error, "from get user posts with id");
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getMyPosts = async (req, res) => {
  try {
    const userId = req.user._id;
    const posts = await Post.find({ user: userId })
      .sort({ createdAt: -1 })
      .populate("user", "username profileImg")
      .populate("likes", "_id username profileImg")
      .populate("comments.user", "username profileImg");
    res.status(200).json({ data: posts });
  } catch (error) {
    console.log(error, "from get my posts");
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getPostById = async (req, res) => {
  try {
    const { id: postId } = req.params;
    if (!postId || !mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(400).json({ error: "post id not found" });
    }
    const post = await Post.findById(postId)
      .populate("user", "username profileImg")
      .populate("likes", "_id username profileImg")
      .populate("comments.user", "username profileImg");
    if (!post) {
      return res.status(400).json({ message: "post not found" });
    }

    res.status(200).json({ data: post });
  } catch (error) {
    console.log(error, "from get post by id");
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getLikedPostDetails = async (req, res) => {
  try {
    const { id: postId } = req.params;
    const post = await Post.findById(postId)
      .populate("likes", "_id username profileImg following")
      .select("likes");
    res.status(200).json({ data: post });
  } catch (error) {
    console.log(error, "from get likes post details");
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getPostComments = async (req, res) => {
  try {
    const { id: postId } = req.params;
    const post = await Post.findById(postId)
      .populate("comments.user", "username profileImg")
      .select("comments");
    res.status(200).json({ data: post.comments });
  } catch (error) {
    console.log(error, "from get post comments");
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const deleteComment = async (req, res) => {
  try {
    const { postId, commentId } = req.params;

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(400).json({ error: "Post not found" });
    }

    console.log(post, "post from delete comment");
    const comment = post.comments.find(
      (comment) => comment._id.toString() === commentId
    );
    if (!comment) {
      return res.status(400).json({ error: "Comment not found" });
    }
    if (
      comment.user.toString() !== req.user._id.toString() &&
      post.user.toString() !== req.user._id.toString()
    ) {
      return res.status(400).json({ error: "You are not authorized" });
    }
    post.comments = post.comments.filter(
      (comment) => comment._id.toString() !== commentId
    );
    const io = getIO();

    await post.save();
    // const io = getIO();

    io.emit("delete-comment", { postId });

    res.status(200).json({ message: "Comment deleted successfully" });
  } catch (error) {
    console.log(error.message, "from delete comment");
    res.status(500).json({ error: "Internal Server Error" });
  }
};
