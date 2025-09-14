const mongoose = require("mongoose");

const messageSchema = mongoose.Schema(
    {
        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "users",
            required: true,
        },
        channel: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "channels",
            required: true,
        },
        mentions: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "users",
            }
        ],
        content: {
            type: String,
            required: true,
        },
        files: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "files"
            }
        ],
        emoticons: [
            {
                sender: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "users",
                },
                code: {
                    type: String
                }
            }
        ],
        pinndBy: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "users",
            }
        ],
        isDraft: {
            type: Boolean,
            default: false
        },
        parentID: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "messages",
            default: null
        },
        childCount: {
            type: Number
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("messages", messageSchema);
