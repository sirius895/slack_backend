const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const generateToken = require('../utils/generateToken');
const { default: resState } = require("../constants/resState");
const { tokenVerify } = require("../services/authService");
const { TYPES, METHODS } = require('../constants/chat');
const { multiEmit } = require("../utils/chat");
require("dotenv").config();


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
        if (!user) return res.json({
            status: resState.ERROR,
            message: "User is not found!",
            payload: ""
        })
        const isMatched = await bcrypt.compare(password, user.password);
        if (!isMatched) return res.json({
            status: resState.ERROR,
            message: "Password is not correct!",
            payload: "",
        })
        await User.updateOne({ email }, { state: 3 })
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

exports.getUserByToken = async (req, res) => {
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
        const userInfo = await User.findById(user._id)
        return res.status(200).json({
            status: resState.SUCCESS,
            message: "Authorized",
            payload: userInfo
        })
    } catch (error) {
        return res.status(500).json(500)({
            status: resState.ERROR,
            message: "Server Error",
            payload: {}
        })
    }
}

exports.changeState = async (socket, data) => {
    try {
        await User.findByIdAndUpdate(socket.user._id, data);
        const user = await User.findById(socket.user._id)
        socket.emit(`${TYPES.AUTH}_${METHODS.UPDATE}`, true, user)
        multiEmit(socket.socketList, socket.userList, `${TYPES.AUTH}_${METHODS.BROADCAST}`, true, user)
    } catch (error) {
        socket.emit(`${TYPES.AUTH}_${METHODS.UPDATE}`, false, { message: error.message })
    }
}

