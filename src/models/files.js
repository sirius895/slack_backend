const mongoose = require("mongoose");

const fileSchema = mongoose.Schema(
  {
    originalname: {
      type: String,
      required: true,
    },
    filename: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("files", fileSchema);
