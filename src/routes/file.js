const multer = require("multer");
const router = require("express").Router();
const fileController = require("../controllers/fileController");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/files");
  },
  filename: (req, file, cb) => {
    console.log(file);
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix);
  },
});

const upload = multer({ storage: storage });

router.post("/upload", upload.array("files"), fileController.fileUpload);
router.get("/download/:filename/:originalname", fileController.fileDownload);

module.exports = router;
