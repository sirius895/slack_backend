const jwt = require("jsonwebtoken")

module.exports = (req, res, next) => {
    try {
        const token = (req.headers.authorization).replace("Bearer ", "");
        const user = jwt.decode(token, { secret: process.env.secret })
        if (!user) {
            return res.status(401).json({
                message: "Authorization failed"
            })
        }
        req.user = user;
        next()
    } catch (error) {
        return res.status(500).json(500)({
            message: "Server Error"
        })
    }
    console.log(req.headers.authorization);
}