const mongoose = require('mongoose');
const UserModel = require('./user_model');
const Schema = mongoose.Schema;
const { ObjectId } = mongoose.Schema.Types;

const tweetSchema = new Schema({
    content: {
        type: String,
        required: true
    },
    tweetedBy: {
        type: ObjectId,
        ref: "UserModel",
        required: true
    },
    likes: [{
        type: ObjectId,
        ref: "UserModel"
    }],
    retweetBy: [{
        type: ObjectId,
        ref: "UserModel"
    }],
    image: {
        type: String,
        default: null
    },
    replies: [{
        tweetId: {
            type: ObjectId,
            ref: "TweetModel"
        },
        content: { type: String }
    }]
}, { timestamps: true });

const TweetModel = mongoose.model('TweetModel', tweetSchema);

module.exports = TweetModel