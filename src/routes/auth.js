const router = require("express").Router();
const multer = require("multer");
const authController = require("../controllers/authController");

const upload = multer({ dest: "public/avatars" });

router.post("/signup", upload.single("avatar"), authController.signUp);
router.post("/signin", authController.signIn);
router.get("/verify", authController.getUserByToken);

module.exports = router;
