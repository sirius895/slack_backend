const router = require("express").Router();
const multer = require("multer");
const authController = require("../controllers/authController");
const path = require("path");

const checkFileType = (file, cb) => {
  // Allowed ext
  const filetypes = /jpeg|jpg|png|gif/;

  //check ext
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

  //check mime
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb("Error");
  }
};

const maxSize = 10 * 1024 * 1024; // 10 MB in bytes
const upload = multer({
  dest: "public/avatars",
  limits: { fileSize: maxSize },
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
});

router.post("/signup", upload.single("avatar"), authController.signUp);
router.post("/signin", authController.signIn);
router.get("/verify", authController.getUserByToken);

module.exports = router;
