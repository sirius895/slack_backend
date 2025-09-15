const { model } = require('mongoose');

const Message = model('messages');

exports.create = async (data) => {
    const message = new Message(data);
    return await (await message.save()).populate('sender');
}

exports.read = async (data) => {
    const messages = await Message.find(data);
    if (data.parent == null) {
        const children = await Message.find().in('parent', messages.map(message => message.id));
        return messages.map((message) => {
            const childCount = children.filter(child => child.parent == message.id).length;
            message.childCount = childCount;
            return message;
        });
    }
    return messages;
}

exports.readOne = async (_id) => {
    const message = await Message.findById(_id);
    if (!message)
        throw new Error('Not found message');
    const childCount = await Message.find({ parentID: _id }).count();
    message.childCount = childCount;
    return message;
}

exports.update = async (userId, id, updateMessageDto) => {
    const message = await Message.findById(id);
    if (!message)
        throw new Error('Not found message');
    if (message.sender != userId)
        throw new Error('User has no permission to update this message');
    await Message.findByIdAndUpdate(id, updateMessageDto);
    return this.readOne(id);
}

exports.delete = async (userId, id) => {
    const message = await Message.findById(id);
    if (!message)
        throw new Error('Not found message');
    if (message.sender != userId)
        throw new Error('User has no permission to update this message');
    return Message.findByIdAndDelete(id);
}

exports.handleEmos = async (_id, data) => {
    const message = await Message.findById(_id);
    const emoticons = message.emoticons;
    let updatedEmos = [];
    console.log(data, emoticons);

    if (emoticons.find(emo => String(emo.sender) === String(data.sender) && String(emo.code) === String(data.code))) {
        console.log("here");

        updatedEmos = emoticons.filter((emo) => !(String(emo.sender) === String(data.sender) && String(emo.code) === String(data.code)));
    } else {
        updatedEmos = [...emoticons, data]
    }
    await Message.findByIdAndUpdate(_id, {
        emoticons: updatedEmos,
    });
    return await Message.findById(_id).populate("sender");
}

exports.readByChannelID = async (channelID) => {
    return await Message.find({ channelID }).populate("sender");
}