const jwt = require("jsonwebtoken");

exports.tokenVerify = (token) => {
  return jwt.decode(token.replace("Bearer ", ""), {
    secret: process.env.SECRET,
  });
};
