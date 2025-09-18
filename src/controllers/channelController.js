const { model } = require("mongoose");

const Channel = model("channels");

const channelService = require("../services/channelService");
const { multiEmit } = require("../utils/chat");
const { STATUS, TYPES, METHODS } = require("../constants/chat");

exports.create = async (socket, data) => {
  try {
    console.log(data.members);
    console.log(
      await Channel.find({
        $or: [
          { members: [data.members[0], data.members[1]] },
          { members: [data.members[1], data.members[0]] },
        ],
        isChannel: false,
      })
    );

    if (!data.isChannel) {
      if (
        await (
          await Channel.find({
            $or: [
              { members: [data.members[0], data.members[1]] },
              { members: [data.members[1], data.members[0]] },
            ],
            isChannel: false,
          })
        ).length
      ) {
        throw new Error("Already exists!");
      }
    }
    const channel = await channelService.create(data);
    multiEmit(
      socket.socketList,
      channel.members,
      `${TYPES.CHANNEL}_${METHODS.CREATE}`,
      true,
      channel
    );
  } catch (err) {
    socket.emit(`${TYPES.CHANNEL}_${METHODS.CREATE}`, false, {
      message: err.message,
    });
  }
};

exports.read = async (socket, data) => {
  try {
    const channels = await channelService.read(socket.user.id);
    socket.emit(`${TYPES.CHANNEL}_${METHODS.READ}`, true, channels);
  } catch (err) {
    socket.emit(`${TYPES.CHANNEL}_${METHODS.READ}`, false, {
      message: "Read Failed",
    });
  }
};

exports.update = async (socket, data) => {
  try {
    const { _id, ..._data } = data;
    const oldChannel = await channelService.read(_id);
    const members = oldChannel.members;
    const channel = await channelService.update(socket.user?._id, _id, _data);
    channel.members.forEach((om) => {
      if (!members.includes(om)) members.push(om);
    });
    multiEmit(
      socket.socketList,
      members,
      `${TYPES.CHANNEL}_${METHODS.UPDATE}`,
      true,
      channel
    );
  } catch (err) {
    socket.emit(`${TYPES.CHANNEL}_${METHODS.UPDATE}`, false, {
      message: err.message,
    });
  }
};

exports.delete = async (socket, data) => {
  try {
    console.log(await channelService.read(data));
    if (
      String((await channelService.read(data)).creator) !==
      String(socket.user?._id)
    )
      throw new Error("User has no permission to delete this channel");
    const channel = await channelService.delete(data);
    console.log(channel);
    multiEmit(
      socket.socketList,
      channel.members,
      `${TYPES.CHANNEL}_${METHODS.DELETE}`,
      true,
      channel
    );
  } catch (err) {
    socket.emit(`${TYPES.CHANNEL}_${METHODS.DELETE}`, STATUS.FAILED, {
      message: err.message,
    });
  }
};

exports.readByUserID = async (socket, data) => {
  try {
    const channels = await channelService.readByUserID(data);
    socket.emit(`${TYPES.CHANNEL}_${METHODS.READ_BY_USER_ID}`, true, channels);
  } catch (err) {
    socket.emit(`${TYPES.CHANNEL}_${METHODS.READ_BY_USER_ID}`, false, {
      ...data,
      message: err.message,
    });
  }
};
