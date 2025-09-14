const express = require('express');
const authRouter = require('./auth');
const userRouter = require('./user');

module.exports = (app) => {
    app.use('/avatars', express.static("public/avatars"))
    app.use('/auth', authRouter);
    app.use('/user', userRouter);
}