const { model } = require('mongoose');

const Channel = model('channels');

exports.create = async (createChannelDto) => {
    // if (!createChannelDto.members.some(member => member == createChannelDto.creator)) {
    //     createChannelDto.members = [...createChannelDto.members, createChannelDto.creator];
    // }
    // if (createChannelDto.members.length < 2)
    //     throw new Error('Please select more than two members');
    const channel = new Channel(createChannelDto);
    return await channel.save();
}

// exports.read = async (userId) => {
//     return await Channel.find({ members: { $in: [userId] } });
// }

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

// exports.update = async (userId, id, updateChannelDto) => {
//     const channel = await Channel.findById(id);
//     if (channel.creator != userId)
//         throw new Error('User has no permission to update this channel');
//     if (!channel)
//         throw new Error('Not found channel');
//     await Channel.findByIdAndUpdate(id, updateChannelDto);
//     return this.readOne(id);
// }

exports.delete = async (userId, id) => {
    const channel = await Channel.findById(id);
    if (channel.creator != userId)
        throw new Error('User has no permission to update this channel');
    if (!channel)
        throw new Error('Not found channel');
    return Channel.findByIdAndDelete(id);
}

exports.readByChannelID = async (userId) => {
    return await Channel.find({ members: { $in: [userId] } });
}
