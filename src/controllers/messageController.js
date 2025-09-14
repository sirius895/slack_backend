const messageService = require('../services/messageService');
const channelService = require('../services/channelService');
const { multiEmit } = require('../utils/chat');
const { STATUS, TYPES, METHODS } = require('../constants/chat');

exports.create = async (socket, data) => {
    try {
        const message = await messageService.create(data);
        const channel = await channelService.read(message.channelID);
        console.log(channel);
        multiEmit(socket.socketList, channel.members, `${TYPES.MESSAGE}_${METHODS.CREATE}`, true, message);
        // if (data.parent) {
        //     multiEmit(socket.socketList, channel.members, `${TYPES.MESSAGE}_${METHODS.UPDATE}`, STATUS.ON, await messageService.readOne(data.parent));
        // }
        // socket.emit(`${TYPES.MESSAGE}_${METHODS.CREATE}`, STATUS.SUCCESS, data);
    } catch (err) {
        console.error(err);
        socket.emit(`${TYPES.MESSAGE}_${METHODS.CREATE}`, false, { message: err.message });
    }
}

exports.read = async (socket, data) => {
    try {
        const messages = await messageService.read(data);
        socket.emit(`${TYPES.MESSAGE}_${METHODS.READ}`, STATUS.ON, { ...data, messages });
    } catch (err) {
        socket.emit(`${TYPES.MESSAGE}_${METHODS.READ}`, STATUS.FAILED, { ...data, message: err.message });
    }
}

exports.update = async (socket, data) => {
    try {
        const message = await messageService.update(socket.user.id, data.id, data.message);
        const channel = await channelService.readOne(message.channel);
        multiEmit(socket.socketList, channel.members, `${TYPES.MESSAGE}_${METHODS.UPDATE}`, STATUS.ON, message);
        socket.emit(`${TYPES.MESSAGE}_${METHODS.UPDATE}`, STATUS.SUCCESS, data);
    } catch (err) {
        socket.emit(`${TYPES.MESSAGE}_${METHODS.UPDATE}`, STATUS.FAILED, { ...data, message: err.message });
    }
}

exports.delete = async (socket, data) => {
    try {
        const message = await messageService.delete(socket.user._id, data);
        const channel = await channelService.read(message.channelID);
        multiEmit(socket.socketList, channel.members, `${TYPES.MESSAGE}_${METHODS.DELETE}`, true, data);
    } catch (err) {
        socket.emit(`${TYPES.MESSAGE}_${METHODS.DELETE}`, false, { message: err.message });
    }
}

exports.emoticon = async (socket, data) => {
    try {
        const message = await messageService.emoticon(data.messageId, { creator: socket.user.id, code: data.emoticonId });
        const channel = await channelService.readOne(message.channel);
        multiEmit(socket.socketList, channel.members, `${TYPES.MESSAGE}_${METHODS.UPDATE}`, STATUS.ON, message);
        socket.emit(TYPES.EMOTICON, STATUS.SUCCESS, data);
    } catch (err) {
        socket.emit(TYPES.EMOTICON, STATUS.FAILED, { ...data, message: err.message });
    }
}

exports.typing = async (socket, data) => {
    try {
        const channel = await channelService.readOne(data.channelId);
        multiEmit(socket.socketList, channel.members, TYPES.TYPING, STATUS.ON, { ...data, user: socket.user.id });
        socket.emit(TYPES.TYPING, STATUS.SUCCESS, data);
    } catch (err) {
        socket.emit(TYPES.TYPING, STATUS.FAILED, { ...data, message: err.message });
    }
}

exports.readByChannelID = async (socket, data) => {
    try {
        console.log(data, "================");

        const messages = await messageService.readByChannelID(data);
        console.log(messages);

        socket.emit(`${TYPES.MESSAGE}_${METHODS.READ_BY_CHANNEL_ID}`, true, messages);
    } catch (error) {
        socket.emit(`${TYPES.MESSAGE}_${METHODS.READ_BY_CHANNEL_ID}`, false, { message: err.message });
    }
}