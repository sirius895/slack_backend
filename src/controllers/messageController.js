const messageService = require("../services/messageService");
const channelService = require("../services/channelService");
const { multiEmit } = require("../utils/chat");
const { STATUS, TYPES, METHODS } = require("../constants/chat");

exports.create = async (socket, data) => {
  try {
    const message = await messageService.create(data);
    const channel = await channelService.read(message.channelID);
    multiEmit(
      socket.socketList,
      channel.members,
      `${TYPES.MESSAGE}_${METHODS.CREATE}`,
      true,
      message
    );
  } catch (err) {
    console.error(err);
    socket.emit(`${TYPES.MESSAGE}_${METHODS.CREATE}`, false, {
      message: err.message,
    });
  }
};

exports.read = async (socket, data) => {
  try {
    const messages = await messageService.read(data);
    socket.emit(`${TYPES.MESSAGE}_${METHODS.READ}`, STATUS.ON, {
      ...data,
      messages,
    });
  } catch (err) {
    socket.emit(`${TYPES.MESSAGE}_${METHODS.READ}`, STATUS.FAILED, {
      ...data,
      message: err.message,
    });
  }
};

exports.update = async (socket, data) => {
  try {
    const { _id, ..._data } = data;
    const message = await messageService.update(socket.user?._id, _id, _data);
    const channel = await channelService.read(message.channelID);
    multiEmit(
      socket.socketList,
      channel.members,
      `${TYPES.MESSAGE}_${METHODS.UPDATE}`,
      true,
      message
    );
  } catch (err) {
    socket.emit(`${TYPES.MESSAGE}_${METHODS.UPDATE}`, false, {
      message: err.message,
    });
  }
};

exports.delete = async (socket, data) => {
  try {
    const message = await messageService.delete(socket.user?._id, data);
    const channel = await channelService.read(message.channelID);
    multiEmit(
      socket.socketList,
      channel.members,
      `${TYPES.MESSAGE}_${METHODS.DELETE}`,
      true,
      message
    );
  } catch (err) {
    socket.emit(`${TYPES.MESSAGE}_${METHODS.DELETE}`, false, {
      message: err.message,
    });
  }
};

exports.handleEmos = async (socket, data) => {
  try {
    const { messageID, code } = data;
    const message = await messageService.handleEmos(messageID, {
      sender: socket.user?._id,
      code,
    });
    const channel = await channelService.read(message.channelID);
    multiEmit(
      socket.socketList,
      channel.members,
      `${TYPES.MESSAGE}_${METHODS.UPDATE}`,
      true,
      message
    );
  } catch (err) {
    console.log(err);
    socket.emit(TYPES.EMOTICON, false, { message: err.message });
  }
};

exports.typing = async (socket, data) => {
  try {
    const { channelID, messageID } = data;
    const channel = await channelService.read(channelID);
    multiEmit(
      socket.socketList,
      channel.members.filter((m) => String(m) !== String(socket.user?._id)),
      TYPES.TYPING,
      true,
      { messageID, user: socket.user?._id }
    );
  } catch (err) {
    socket.emit(TYPES.TYPING, false, { message: err.message });
  }
};

exports.readByChannelID = async (socket, data) => {
  try {
    const messages = await messageService.readByChannelID(data);
    socket.emit(
      `${TYPES.MESSAGE}_${METHODS.READ_BY_CHANNEL_ID}`,
      true,
      messages
    );
  } catch (err) {
    socket.emit(`${TYPES.MESSAGE}_${METHODS.READ_BY_CHANNEL_ID}`, false, {
      message: err.message,
    });
  }
};

exports.readByParentID = async (socket, data) => {
  try {
    const messages = await messageService.readByParentID(data);
    socket.emit(
      `${TYPES.MESSAGE}_${METHODS.READ_BY_PARENT_ID}`,
      true,
      messages
    );
  } catch (err) {
    socket.emit(`${TYPES.MESSAGE}_${METHODS.READ_BY_PARENT_ID}`, false, {
      message: err.message,
    });
  }
};
