const { model } = require("mongoose");

const Channel = model("channels");

exports.create = async (data) => {
  const channel = new Channel(data);
  return await channel.save();
};

exports.read = async (id) => {
  const channel = await Channel.findById(id);
  if (!channel) throw new Error("Not found channel");
  return channel;
};

exports.update = async (userID, _id, data) => {
  if (String((await this.read(_id)).creator) !== String(userID))
    throw new Error("User has no permission to update this channel");
  await Channel.findByIdAndUpdate(_id, data);
  return await this.read(_id);
};

exports.delete = async (_id) => {
  const channel = await Channel.findById(_id);
  if (!channel) throw new Error("Not found channel");
  return Channel.findByIdAndDelete(_id);
};

exports.readByUserID = async (userId) => {
  return await Channel.find({ members: { $in: [userId] } });
};
