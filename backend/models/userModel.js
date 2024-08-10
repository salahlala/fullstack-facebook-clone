import mongoose from "mongoose";
import { Schema, model } from "mongoose";
const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    fullName: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
      minLength: 8,
      select: false,
    },
    followers: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
        default: [],
      },
    ],
    following: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
        default: [],
      },
    ],
    profileImg: {
      type: Object,
      default: {
        public_id: null,
        url: null,
      },
    },
    bio: { type: String, default: "" },
    coverImg: {
      type: String,
      default: "",
    },
    likedPosts: [
      {
        type: Schema.Types.ObjectId,
        ref: "Post",
        default: [],
      },
    ],
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
  },
  { timestamps: true }
);

userSchema.methods.changePasswordAfter = function (timestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return timestamp < changedTimestamp;
  }

  return false;
};

const User = mongoose.models.User || model("User", userSchema);

export default User;
