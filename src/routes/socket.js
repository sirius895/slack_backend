const { TYPES, METHODS, STATUS } = require('../constants/chat');
const authService = require('../services/authService');
const authCtr = require("../controllers/authController")
const channelCtr = require('../controllers/channelController');
const messageCtr = require('../controllers/messageController');

let socketList = {};
let userList = [];

const authMdr = (socket, data, next) => {
    try {
        const token = socket.handshake.headers.token;
        const user = authService.tokenVerify(token);
        socket.user = user;

        if (!token) throw new Error('Unauthorized');
        next(socket, data);
    } catch (err) {
        socket.emit(TYPES.AUTH, false, err.message);
    }
}

const removeAuth = (socket) => {
    try {
        console.log("disconnect");
        if (!socketList[socket?.user?._id]) return;
        socketList[socket.user._id] = socketList[socket.user._id].filter(s => s.id !== socket.id)
        socket.socketList = socketList
        userList = userList.filter(u => u !== socket.user._id)
    } catch (error) {
        console.log("removeErr", error);
    }
}

const onConnect = (socket) => {
    try {

        console.log(`Socket ${socket.id} is connected`);
        socket.on(TYPES.AUTH, (token) => {
            console.log(`User login with token ${token}`);
            const user = authService.tokenVerify(token);
            console.log(user);
            
            if (user) {
                if (!socketList[user._id]) socketList[user._id] = [];
                if (!socketList[user._id].find(s => String(s.id) === String(socket.id))) socketList[user._id].push(socket);
                if (!userList.find(u => String(u) === String(user._id))) userList.push(user._id)
                socket.socketList = socketList
                socket.userList = userList
            } else {
                throw new Error("Unauthorized");
            }
        });
        socket.on(`disconnect`, () => removeAuth(socket));
        socket.on(`${TYPES.AUTH}_${METHODS.UPDATE}`, (data) => authMdr(socket, data, authCtr.changeState));

        socket.on(`${TYPES.CHANNEL}_${METHODS.CREATE}`, (data) => authMdr(socket, data, channelCtr.create));
        socket.on(`${TYPES.CHANNEL}_${METHODS.READ}`, (data) => authMdr(socket, data, channelCtr.read));
        socket.on(`${TYPES.CHANNEL}_${METHODS.UPDATE}`, (data) => authMdr(socket, data, channelCtr.update));
        socket.on(`${TYPES.CHANNEL}_${METHODS.DELETE}`, (data) => authMdr(socket, data, channelCtr.delete));
        socket.on(`${TYPES.CHANNEL}_${METHODS.READ_BY_USER_ID}`, (data) => authMdr(socket, data, channelCtr.readByUserID));
        socket.on(`${TYPES.MESSAGE}_${METHODS.CREATE}`, (data) => authMdr(socket, data, messageCtr.create));
        socket.on(`${TYPES.MESSAGE}_${METHODS.READ}`, (data) => authMdr(socket, data, messageCtr.read));
        socket.on(`${TYPES.MESSAGE}_${METHODS.UPDATE}`, (data) => authMdr(socket, data, messageCtr.update));
        socket.on(`${TYPES.MESSAGE}_${METHODS.DELETE}`, (data) => authMdr(socket, data, messageCtr.delete));
        socket.on(`${TYPES.MESSAGE}_${METHODS.READ_BY_CHANNEL_ID}`, (data) => authMdr(socket, data, messageCtr.readByChannelID));
        socket.on(`${TYPES.MESSAGE}_${METHODS.READ_BY_PARENT_ID}`, (data) => authMdr(socket, data, messageCtr.readByParentID));
        socket.on(`${TYPES.MESSAGE}_${METHODS.HANDLE_EMOS}`, (data) => authMdr(socket, data, messageCtr.handleEmos));
        // socket.on(TYPES.EMOTICON, (data) => authMdr(socket, data, messageCtr.emoticon));
        socket.on(TYPES.TYPING, (data) => authMdr(socket, data, messageCtr.typing));
    } catch (error) {
        console.log("auth error", error.message);
    }
}

exports.onConnect = onConnect;
