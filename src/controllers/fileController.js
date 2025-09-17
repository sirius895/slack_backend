const { model } = require("mongoose");
const File = model("files");

// const File = require("../models/files")

exports.fileUpload = async (req, res) => {
  try {
    const data = req.files.map((f) => ({ originalname: f.originalname, filename: f.filename }));
    const result = await File.insertMany(data);
    return res.status(201).json({ message: "File Upload Success", payload: result });
  } catch (error) {}
};

exports.fileDownload = (req, res) => {
  try {
    console.log(req.params);

    res.download(`public/files/${req.params.filename}`, req.params.originalname, () => {});
  } catch (error) {
    res.json({ message: "Download failed." });
  }
};
