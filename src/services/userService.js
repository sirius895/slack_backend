const { model } = require('mongoose');

const User = model('users');

exports.create = (data) => {
    const user = new User(data);
    return user.save();
}

exports.read = async () => {
    return await User.find();
}

exports.readOne = async (id) => {
    const user = await User.findById(id);
    if (!user)
        throw new Error('Not found user');
    return user;
}

exports.update = (id, updateUserDto) => {
    return User.findByIdAndUpdate(id, updateUserDto);
}

exports.delete = (id) => {
    return User.findByIdAndDelete(id);
}
