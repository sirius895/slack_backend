const { REQUEST, METHOD, STATUS } = require('../constants/chat');
const authService = require('../services/authService');
const channelCtr = require('../controllers/channelController');
const messageCtr = require('../controllers/messageController');

const socketList = {};

const authMdr = (socket, data, next) => {
    try {
        const token = socket.handshake.headers.token;
        console.log(socket.handshake.headers.token);
        const user = authService.tokenVerify(token);
        socket.user = user;
        if (!token)
            throw new Error('Unauthorized');
        next(socket, data);
    } catch (err) {
        socket.emit(REQUEST.AUTH, STATUS.FAILED, err.message);
    }
}

const onConnect = (socket) => {
    console.log(`Socket ${socket.id} is connected`);
    socket.socketList = socketList;
    socket.on(REQUEST.AUTH, (token) => {
        console.log(`User login with token ${token}`);
        const user = authService.tokenVerify(token);
        if (user) {
            if (!socketList[user.id]) {
                socketList[user.id] = [];
            }
            socketList[user.id].push(socket);
        }
    });
    socket.on(`${REQUEST.CHANNEL}_${METHOD.CREATE}`, (data) => authMdr(socket, data, channelCtr.create));
    socket.on(`${REQUEST.CHANNEL}_${METHOD.READ}`, (data) => authMdr(socket, data, channelCtr.read));
    socket.on(`${REQUEST.CHANNEL}_${METHOD.UPDATE}`, (data) => authMdr(socket, data, channelCtr.update));
    socket.on(`${REQUEST.CHANNEL}_${METHOD.DELETE}`, (data) => authMdr(socket, data, channelCtr.delete));
    socket.on(`${REQUEST.MESSAGE}_${METHOD.CREATE}`, (data) => authMdr(socket, data, messageCtr.create));
    socket.on(`${REQUEST.MESSAGE}_${METHOD.READ}`, (data) => authMdr(socket, data, messageCtr.read));
    socket.on(`${REQUEST.MESSAGE}_${METHOD.UPDATE}`, (data) => authMdr(socket, data, messageCtr.update));
    socket.on(`${REQUEST.MESSAGE}_${METHOD.DELETE}`, (data) => authMdr(socket, data, messageCtr.delete));
    socket.on(REQUEST.EMOTICON, (data) => authMdr(socket, data, messageCtr.emoticon));
    socket.on(REQUEST.TYPING, (data) => authMdr(socket, data, messageCtr.typing));
}

exports.onConnect = onConnect;
