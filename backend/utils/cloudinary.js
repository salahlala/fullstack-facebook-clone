import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";

dotenv.config({ path: "./config.env" });
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const cloudinaryUploadImage = async (file) => {
  try {
    const options = {
      folder: "posts",
    };

    const result = await cloudinary.uploader.upload(file, options);
    // console.log(result,'result ')
    return result;
  } catch (error) {
    console.log(error, "from cloudinaryUploadImage");
    return null;
  }
};

export const cloudinaryDeleteImage = async (publicId) => {
  return await cloudinary.uploader
    .destroy(publicId, {
      invalidate: true,
      resource_type: "image",
    })
    .catch((err) => console.log(err, "from cloudinaryDeleteImage"));
};
