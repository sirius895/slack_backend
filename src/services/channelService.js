const { model } = require('mongoose');

const Channel = model('channels');

exports.create = async (data) => {
    const channel = new Channel(data);
    return await channel.save();
}

exports.read = async (id) => {
    const channel = await Channel.findById(id);
    if (!channel)
        throw new Error('Not found channel');
    return channel;
}

exports.update = async (id, data) => {
    await Channel.findByIdAndUpdate(id, data)
    return await this.read(id)
}

exports.delete = async (_id) => {
    const channel = await Channel.findById(_id);
    if (!channel) throw new Error('Not found channel');
    return Channel.findByIdAndDelete(_id);
}

exports.readByChannelID = async (userId) => {
    return await Channel.find({ members: { $in: [userId] } });
}
