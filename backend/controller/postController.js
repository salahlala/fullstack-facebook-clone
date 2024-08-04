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

import {
  cloudinaryUploadImage,
  cloudinaryDeleteImage,
} from "../utils/cloudinary.js";
// Get the directory name of the current module file
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "..", "public", "images"));
  },
  filename: (req, file, cb) => {
    console.log(file, "file");
    const ext = file.mimetype.split("/")[1];
    cb(null, `post-${req.user._id}-${Date.now()}.${ext}`);
  },
});
const multerFilter = (req, file, cb) => {
  console.log(file, "file.mimetype");
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb("Please upload only images", false);
  }
};
const upload = multer({ storage: multerStorage, fileFilter: multerFilter });

export const uploadImg = upload.single("img");

export const resizePostPhoto = async (req, res, next) => {
  try {
    if (!req.file) return next();

    console.log(req.file, "req.file");
    req.file.filename = `post-${Date.now()}.jpeg`;
    if (!req.file.buffer || req.file.buffer.length === 0) {
      console.log("Empty file buffer");
      return next(new Error("Empty file buffer"));
    }

    await sharp(req.file.buffer)
      // .resize(270, 220)
      .toFormat("jpeg")
      .jpeg({ quality: 90 })
      .toFile(`../public/images/${req.file.filename}`);

    next();
  } catch (error) {
    console.log(error);
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

    if (!user) {
      return res.status(400).json({ error: "user not found" });
    }
    if (!text) {
      return res.status(400).json({ error: "text field is required" });
    }
    console.log(text, "text");
    if (req.file) {
      console.log(req.file, "req.file");
      const result = await cloudinaryUploadImage(req.file.path);
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

    res.status(201).json({ post });

  } catch (error) {
    console.log(error, "from create post");
    res.status(500).json({ error: "Internal Server Error" });
  }
};
export const deletePost = async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;
  try {
    const post = await Post.findById(id);
    if (!post) {
      return res.status(400).json({ error: "post not found" });
    }

    if (post.user.toString() !== userId.toString()) {
      return res.status(401).json({ error: "unauthorized" });
    }
    if (post.img?.url) {
      const imgId = post.img.url.split("/").pop().split(".")[0];
      await cloudinary.uploader.destroy(imgId);
    }
    await Post.findByIdAndDelete(id);
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
    console.log(req.body, "comment post");
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
    res.status(200).json({ post });
  } catch (error) {
    console.log(error)
  }
};

export const likeUnlikePost = async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;
  try {
    const post = await Post.findById(id);
    if (!post) {
      return res.status(400).json({ error: "post not found" });
    }
    const isLiked = post.likes.includes(userId);
    if (isLiked) {
      await Post.updateOne({ _id: id }, { $pull: { likes: userId } });
      await User.updateOne({ _id: userId }, { $pull: { likedPosts: id } });
      return res.status(200).json({ message: "unliked successfully" });
    } else {
      post.likes.push(userId);
      await User.updateOne({ _id: userId }, { $push: { likedPosts: id } });

      await post.save();
      const notification = new Notification({
        from: userId,
        to: post.user,
        type: "like",
      });
      await notification.save();
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
  const { text } = req.body;
  let curPath;
  try {
    const post = await Post.findById(id);
    const userId = req.user._id;
    if (!post) {
      return res.status(400).json({ error: "post not found" });
    }
    if (post.user.toString() !== userId.toString()) {
      return res.status(401).json({ error: "unauthorized" });
    }
    if (req.file) {
      console.log(req.file, "from update post");
      const result = await cloudinaryUploadImage(req.file.path);
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
    res.status(200).json({ post });
  } catch (error) {
    console.log(error, "from update post");
    res.status(500).json({ error: "Internal Server Error" });
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
    const posts = await Post.find({ user: { $in: following } })
      .populate("user", "username profileImg")
      .populate("likes", "_id username profileImg")

      .populate("comments.user", "username profileImg");
    res.status(200).json({ posts });
  } catch (error) {}
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

export const getLikedPostDetails = async (req, res) => {
  try {
    const { id: postId } = req.params;
    const post = await Post.findById(postId).populate(
      "likes",
      "_id username profileImg"
    ).select("likes");
    res.status(200).json({ data: post });
  } catch (error) {
    console.log(error, "from get likes post details");
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getPostComments = async (req, res) => {
  try {
    const { id: postId } = req.params;
    const post = await Post.findById(postId).populate(
      "comments.user",
      "username profileImg"
    ).select("comments");
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
    console.log({ post:post.comments, commentId });
    const comment = post.comments.find((comment) => comment._id.toString() === commentId);
    if (!comment) {
      return res.status(400).json({ error: "Comment not found" });
    }
    if (comment.user.toString() !== req.user._id.toString() && post.user.toString() !== req.user._id.toString()) {
      return res.status(400).json({ error: "You are not authorized" });
    }
    post.comments = post.comments.filter((comment) => comment._id.toString() !== commentId);
    await post.save();
    res.status(200).json({ message: "Comment deleted successfully" });
    
  } catch (error) {
    
  }
}