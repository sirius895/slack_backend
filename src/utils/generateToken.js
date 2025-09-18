const jwt = require('jsonwebtoken')
require('dotenv').config()

const generateToken = (user) => {
    const Token = jwt.sign(
        {
            _id: user?._id,
            email: user.email,
            username: user.username,
        },
        process.env.SECRET,
        { expiresIn: "1d" }
    );

    return Token;
};

module.exports = generateToken;