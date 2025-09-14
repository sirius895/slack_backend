const channelService = require('../services/channelService');
const { multiEmit } = require('../utils/chat');
const { STATUS, TYPES, METHODS } = require('../constants/chat');

exports.create = async (socket, data) => {
    try {
        console.log(data);

        const channel = await channelService.create(data);
        multiEmit(socket.socketList, channel.members, `${TYPES.CHANNEL}_${METHODS.CREATE}`, true, channel);
        // socket.emit(`${TYPES.CHANNEL}_${METHODS.CREATE}`, true, channel);
    } catch (err) {
        console.error(err);
        socket.emit(`${TYPES.CHANNEL}_${METHODS.CREATE}`, STATUS.FAILED, { ...data, message: err.message });
    }
}

exports.read = async (socket, data) => {
    try {
        const channels = await channelService.read(socket.user.id);
        socket.emit(`${TYPES.CHANNEL}_${METHODS.READ}`, STATUS.ON, channels);
    } catch (err) {
        socket.emit(`${TYPES.CHANNEL}_${METHODS.READ}`, STATUS.FAILED, { ...data, message: err.message });
    }
}

exports.update = async (socket, data) => {
    try {
        const { _id, ..._data } = data
        const channel = await channelService.update(_id, _data);
        console.log(channel);
        multiEmit(socket.socketList, channel.members, `${TYPES.CHANNEL}_${METHODS.UPDATE}`, true, channel);
        // socket.emit(`${TYPES.CHANNEL}_${METHODS.UPDATE}`, STATUS.SUCCESS, data);

        // const channel = await channelService.update(socket.user.id, data.id, data.channel);
    } catch (err) {
        socket.emit(`${TYPES.CHANNEL}_${METHODS.UPDATE}`, STATUS.FAILED, { ...data, message: err.message });
    }
}

exports.delete = async (socket, data) => {
    try {
        const channel = await channelService.delete(socket.user.id, data.id);
        multiEmit(socket.socketList, channel.members, `${TYPES.CHANNEL}_${METHODS.DELETE}`, STATUS.ON, data);
        socket.emit(`${TYPES.CHANNEL}_${METHODS.DELETE}`, STATUS.SUCCESS, data);
    } catch (err) {
        socket.emit(`${TYPES.CHANNEL}_${METHODS.DELETE}`, STATUS.FAILED, { ...data, message: err.message });
    }
}

exports.readByUserID = async (socket, data) => {
    try {
        const channels = await channelService.readByChannelID(data);
        socket.emit(`${TYPES.CHANNEL}_${METHODS.READ_BY_USER_ID}`, true, channels);
    } catch (err) {
        socket.emit(`${TYPES.CHANNEL}_${METHODS.READ_BY_USER_ID}`, false, { ...data, message: err.message });
    }
}
