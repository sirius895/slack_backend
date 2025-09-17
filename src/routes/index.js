const express = require("express");
const authRouter = require("./auth");
const userRouter = require("./user");
const fileRouter = require("./file");

module.exports = (app) => {
  app.use("/avatars", express.static("public/avatars"));
  app.use("/files", express.static("public/files"));
  app.use("/auth", authRouter);
  app.use("/user", userRouter);
  app.use("/file", fileRouter);
};
