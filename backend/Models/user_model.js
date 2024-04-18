const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { ObjectId } = mongoose.Schema.Types

const userSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    profileImg: {
        type: String,
        default: null
    },
    location: {
        type: String
    },
    dob: {
        type: Date
    },
    followers: [{
        type: ObjectId,
        ref: "UserModel"
    }],
    following: [{
        type: ObjectId,
        ref: "UserModel"
    }]
}, { timestamps: true });

const UserModel = mongoose.model('UserModel', userSchema);

module.exports = UserModel;