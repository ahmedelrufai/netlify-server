const uploadRouter = require("express").Router();
const cloudinary = require("cloudinary");
const auth = require("../../middleware/auth");
const multer = require("multer");
const fs = require("fs");
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/user-uploads");
  },
  filename: function (req, file, cb) {
    cb(null, new Date().toISOString() + "--" + file.originalname);
  },
});
// function fileFilter(req,file,cb){
//   if (file.mimetype !== "image/jpg" || file.mimetype !== "image/png" || file.mimetype !== "image/jpeg") cb(null,false)

// }
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024,
  },
});

//uploading image on cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

//uploda image
uploadRouter.post("/upload/", upload.single("file"), (req, res) => {
  res.json({ path: req.file.path });
});
uploadRouter.post("/upload/destroy", (req, res) => {
  try {
    const { public_id } = req.body;
    if (!public_id) return res.json({ msg: "No images selected" });
    cloudinary.v2.uploader.destroy(public_id, async (err, result) => {
      if (err) throw err;
      res.json({ msg: "image deledted" });
    });
  } catch (err) {
    return res.json({ msg: err.message });
  }
});

const removeTmp = (path) => {
  fs.unlink(path, (err) => {
    if (err) throw err;
  });
};

module.exports = uploadRouter;
