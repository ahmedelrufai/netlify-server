const express = require("express");
const uploadRouter = express.Router();
const cloudinary = require("cloudinary");
const auth = require("../../middleware/auth");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const cors = require("cors");
let whitelist = ["https://cvstudio.io", "http://127.0.0.1:5501"];


let corsOptions = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  }
}
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null,"./useruploads/")
  },
  filename: function (req, file, cb) {
    cb(null, new Date().toISOString() + file.originalname);
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
express().use(express.static("useruploads"));

//uploda image
uploadRouter.post(
  "/upload/",
  upload.single("file"),
  cors(corsOptions),
  (req, res) => {
    res.json({ path: req.file.path });
    if (!req.files || Object.keys(req.files).length === 0)
      return res.json({ msg: "No files were uploaded." });

    const file = req.files.file;

    if (file.size > 1024 * 1024) {
      // removeTmp(file.tempFilePath);
      return res.json({ msg: "Size too large" });
    }

    // console.log(file);

    if (
      file.mimetype !== "image/jpg" &&
      file.mimetype !== "image/png" &&
      file.mimetype !== "image/jpeg"
    ) {
      // removeTmp(file.tempFilePath);
      return res.json({ msg: "file type not supported" });
    }

    // cloudinary.v2.uploader.upload(
    //   file.tempFilePath,
    //   { folder: "test" },
    //   function (err, result) {
    //     if (err) throw err;
    // removeTmp(file.tempFilePath);
    // res.send(JSON.stringify({
    //     result: result
    //   })
    // );
    //   res.json({ public_id: result.public_id, url: result.secure_url });
    // }
    // );
  }
);
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

// const removeTmp = (path) => {
//   fs.unlink(path, (err) => {
//     if (err) throw err;
//   });
// };

module.exports = uploadRouter;
