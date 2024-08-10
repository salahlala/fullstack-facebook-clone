import multer from "multer";
const multerStorage = multer.memoryStorage();
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new Error("Not an image! Please upload only images."), false);
  }
};
const upload = multer({ storage: multerStorage, fileFilter: multerFilter });

export default upload;

// const multerStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, path.join(__dirname, "..", "public", "images"));
//   },
//   filename: (req, file, cb) => {
//     const ext = file.mimetype.split("/")[1];
//     cb(null, `post-${req.user._id}-${Date.now()}.${ext}`);
//   },
// });
