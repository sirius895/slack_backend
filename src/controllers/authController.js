const User = require("../models/user");
require("dotenv").config();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const generateToken = require('../utils/generateToken');
const { default: resState } = require("../constants/resState");
const { tokenVerify } = require("../services/authService");

//signUp
exports.signUp = async (req, res) => {
    console.log(req.body);
    try {
        const { email, password, username, avatar } = req.body;
        if (!email || !password || !username) {
            return res.status(200).json({
                status: resState.WARNING,
                message: "Please fill all the fields",
            });
        }
        const user = await User.findOne({ email });
        if (user) {
            return res.status(200).json({
                status: resState.ERROR,
                message: "Email already exists",
            });

        }
        const salt = await bcrypt.genSalt(10)
        const hash = await bcrypt.hash(password, salt);
        await new User({
            username, email, password: hash, avatar
        }).save();
        return res.json({
            status: resState.SUCCESS,
            message: "Sign up success",
        })
    } catch (error) {
        return res.status(500).json({
            status: resState.ERROR,
            message: "Sign up failed",
        })
    }
};

//signIn
exports.signIn = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(200).json({
            status: resState.ERROR,
            message: "User is not found!",
            payload: ""
        })
        const isMatched = await bcrypt.compare(password, user.password);
        if (!isMatched) return res.status(200).json({
            status: resState.ERROR,
            message: "Password is not correct!",
            payload: "",
        })
        const token = generateToken(user);
        return res.json({
            status: resState.SUCCESS,
            message: "Successfully signed",
            payload: token
        })
    } catch (error) {
        return res.status(500).json({
            status: resState.ERROR,
            message: "Server Error",
            payload: ""
        })
    }
};

exports.getUserByToken = (req, res) => {
    try {
        const token = req.headers.authorization
        const user = tokenVerify(token);
        if (!user) {
            return res.status(401).json({
                status: resState.ERROR,
                message: "Authorization failed",
                payload: {}
            })
        }
        return res.status(200).json({
            status: resState.SUCCESS,
            message: "Authorized",
            payload: user
        })
    } catch (error) {
        return res.status(500).json(500)({
            status: resState.ERROR,
            message: "Server Error",
            payload: {}
        })
    }
}

