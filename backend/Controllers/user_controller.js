const UserModel = require("../Models/user_model");
const TweetModel = require("../Models/tweet_model");
const dotenv = require('dotenv').config();
const cloudinary = require('cloudinary');

// Function to get details of a single user
const singleUserDetail = async (req, res) => {
    try {
        // Find the user by ID and exclude the password field from the result
        const user = await UserModel.findById({ _id: req.params.id }, { password: 0 });
        if (!user) {
            return res.status(500).json({ message: "User not found!" });
        }
        return res.status(200).json({ message: "User Details Found", user });
    } catch (error) {
        return res.status(500).json({ message: "Error Occurred!", error })
    }
}

// Function to follow a user
const followUser = async (req, res) => {
    const userAcc = req.user;
    const followId = req.params.id;

    if (userAcc._id == followId) {
        return res.status(500).json({ message: "You cannot follow your own account!" });
    }

    try {
        const user = await UserModel.findOne({ _id: followId })

        if (!user) {
            return res.status(500).json({ message: "User not Found!" });
        }

        const checkFollowing = userAcc.following.includes(followId);
        if (checkFollowing) {
            return res.status(500).json({ message: "You are already following this account" });
        }

        // Update follower and following arrays
        const updateFollower = await user.updateOne({ $push: { followers: userAcc._id } });
        const updateFollowing = await userAcc.updateOne({ $push: { following: user._id } });

        if (!updateFollower || !updateFollowing) {
            return res.status(500).json({ message: "Error Occurred while following" });
        }

        return res.status(200).json({ message: "You followed the account", updateFollower, updateFollowing });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error Occurred!", error });
    }
}

// Function to unfollow a user
const unfollowUser = async (req, res) => {
    const userAcc = req.user;
    const followId = req.params.id;

    if (userAcc._id == followId) {
        return res.status(500).json({ message: "You cannot unfollow your own account!" });
    }

    try {
        const user = await UserModel.findOne({ _id: followId })

        if (!user) {
            return res.status(500).json({ message: "User not Found!" });
        }

        const checkFollowing = userAcc.following.includes(followId);

        if (!checkFollowing) {
            return res.status(500).json({ message: "You are not following this account" });
        }

        // Update follower and following arrays
        const updateFollower = await user.updateOne({ $pull: { followers: userAcc._id } });
        const updateFollowing = await userAcc.updateOne({ $pull: { following: user._id } });

        if (!updateFollower || !updateFollowing) {
            return res.status(500).json({ message: "Error Occurred while unfollowing" });
        }

        return res.status(200).json({ message: "You unfollowed the account", updateFollower, updateFollowing });
    } catch (error) {
        return res.status(500).json({ message: "Error Occurred!", error })
    }
}

// Function to edit user details
const editUserDetails = async (req, res) => {
    const user = req.user;
    const paramsId = req.params.id;
    const { name, location, dob } = req.body;

    try {
        if (user._id != paramsId) {
            return res.status(500).json({ message: "You can only change your account details!" });
        }

        const findUser = await UserModel.findById({ _id: user._id });
        if (!findUser) {
            return res.status(500).json({ message: "User not found!" });
        }

        // Update user details
        const updateUser = await findUser.updateOne({ name, location, dob });
        if (!updateUser) {
            return res.status(500).json({ message: "Error while updating user!" });
        }

        return res.status(200).json({ message: "Details updated successfully!", updateUser });
    } catch (error) {
        return res.status(500).json({ message: "Error Occurred!", error })
    }
}

// Function to get tweets of a user
const userTweets = async (req, res) => {
    const paramsId = req.params.id;

    try {
        // Find tweets by the user ID
        const findTweets = await TweetModel.find({ tweetedBy: paramsId });
        if (!findTweets || findTweets.length === 0) {
            return res.status(200).json({ message: "Tweets not found!" });
        }

        // Sort tweets by createdAt timestamp in descending order
        const sortTweets = await findTweets.sort((a, b) => b.createdAt - a.createdAt);
        if (!sortTweets) {
            return res.status(500).json({ message: "Tweets not sorted!" });
        }

        return res.status(200).json({ message: "Tweets Found!", sortTweets });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Error Occurred!", error });
    }
}

//check when frontend of upload image is made
const uploadProfileImg = async (req, res) => {
    const image = req.body.image;
    const paramsId = req.params.id;

    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET
    });

    try {
        if (!image) {
            return res.status(500).json({ message: "No file uploaded!" });
        }
        // Upload image to Cloudinary
        const cloudinaryResult = await cloudinary.uploader.upload(image);
        if (!cloudinaryResult) {
            return res.status(500).json({ message: "Error while storing image!" });
        }

        // Find the user by ID
        const findUser = await UserModel.findById({ _id: paramsId });
        if (!findUser) {
            return res.status(500).json({ message: "Error while finding User!" });
        }

        // Update user profile image
        const storeImage = await findUser.updateOne({ profileImg: cloudinaryResult.secure_url });
        if (!storeImage) {
            return res.status(500).json({ message: "Error while updating image in user" })
        }

        return res.status(200).json({ message: "Image uploaded successfully!" });
    } catch (error) {
        return res.status(500).json({ message: "Error Occurred!", error });
    }
}

// Function to get all users
const getAllUsers = async (req, res) => {
    try {
        // Find all users
        const allUsers = await UserModel.find();
        if (!allUsers) {
            return res.status(500).json({ message: "Error while finding users!" });
        }

        return res.status(200).json({ message: "All Users Found!", allUsers });
    } catch (error) {
        return res.status(500).json({ message: "Error Occurred!", error });
    }
}

module.exports = {
    singleUserDetail,
    followUser,
    unfollowUser,
    editUserDetails,
    userTweets,
    uploadProfileImg,
    getAllUsers
}
