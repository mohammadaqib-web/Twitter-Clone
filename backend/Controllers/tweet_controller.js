const TweetModel = require("../Models/tweet_model");
const cloudinary = require('cloudinary')

// Function to create a new tweet
const createTweet = async (req, res) => {
    const { content } = req.body;

    // Check if content is provided
    if (!content) {
        return res.status(500).json({ message: "Content is required for the tweet." });
    }

    // Configure Cloudinary
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET
    });

    try {
        // Upload image to Cloudinary if provided
        if (req.body.image) {
            const cloudinaryResult = await cloudinary.uploader.upload(req.body.image);
            if (!cloudinaryResult) {
                return res.status(500).json({ message: "Error while storing image!" });
            }

            // Create new tweet with image
            const tweet = new TweetModel({ content, tweetedBy: req.user._id, image: cloudinaryResult.secure_url });
            if (!tweet) {
                return res.status(500).json({ message: "Error Occurred while creating tweet!" });
            }
            const saveTweet = await tweet.save();

            return res.status(200).json({ message: "Tweet created successfully!", saveTweet });
        }

        // Create new tweet without image
        const tweet = new TweetModel({ content, tweetedBy: req.user._id });
        if (!tweet) {
            return res.status(500).json({ message: "Error Occurred while creating tweet!" });
        }
        const saveTweet = await tweet.save();

        return res.status(200).json({ message: "Tweet created successfully!", saveTweet });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Error Occurred!", error });
    }
}

// Function to like a tweet
const likeTweet = async (req, res) => {
    const tweetId = req.params.id;

    try {
        // Find the tweet by ID
        const findTweet = await TweetModel.findById({ _id: tweetId });
        if (!findTweet) {
            return res.status(500).json({ message: "No tweet found!" });
        }

        // Check if the user has already liked the tweet
        const findLikes = await findTweet.likes.includes(req.user._id);
        if (findLikes) {
            return res.status(500).json({ message: "You already liked the post!" });
        }

        // Add user's ID to likes array
        const updateLikes = await findTweet.updateOne({ $push: { likes: req.user._id } });
        if (!updateLikes) {
            return res.status(500).json({ message: "Error while updating likes!" });
        }

        return res.status(200).json({ message: "Tweet liked successfully!" });
    } catch (error) {
        return res.status(500).json({ message: "Error Occurred!", error });
    }
}

// Function to dislike a tweet
const dislikeTweet = async (req, res) => {
    const tweetId = req.params.id;

    try {
        // Find the tweet by ID
        const findTweet = await TweetModel.findById({ _id: tweetId });
        if (!findTweet) {
            return res.status(500).json({ message: "No tweet found!" });
        }

        // Check if the user has already liked the tweet
        const checkLikes = await findTweet.likes.includes(req.user._id);
        if (!checkLikes) {
            return res.status(500).json({ message: "You didn't liked this post!" });
        }

        // Remove user's ID from likes array
        const updateLikes = await findTweet.updateOne({ $pull: { likes: req.user._id } });
        if (!updateLikes) {
            return res.status(500).json({ message: "Error while removing like!" });
        }

        return res.status(200).json({ message: "Tweet disliked successfully!" });
    } catch (error) {
        return res.status(500).json({ message: "Error Occurred!", error });
    }
}

// Function to reply to a tweet
const replyOnTweet = async (req, res) => {
    const tweetId = req.params.id;
    const { content } = req.body;

    try {
        // Create a new tweet for the reply
        const replyTweet = new TweetModel({
            content,
            tweetedBy: req.user._id,
        });

        // Save the reply tweet
        const savedReplyTweet = await replyTweet.save();
        if (!savedReplyTweet) {
            return res.status(500).json({ message: "Error while saving reply tweet" });
        }

        // Find the original tweet by ID
        const originalTweet = await TweetModel.findById(tweetId);
        if (!originalTweet) {
            return res.status(500).json({ message: "Original tweet not found!" });
        }

        // Update the original tweet's replies field with the reply tweet object
        const updateReplies = await originalTweet.updateOne({
            $push: { replies: { tweetId: savedReplyTweet._id, content: savedReplyTweet.content } },
        });

        if (!updateReplies) {
            return res.status(500).json({ message: "Error while updating replies on tweet" });
        }

        return res.status(200).json({
            message: "Reply is successfully posted!",
            replyTweet: savedReplyTweet,
            updateReplies,
        });
    } catch (error) {
        return res.status(500).json({ message: "Error Occurred!", error });
    }
};

// Function to get details of a single tweet
const singleTweetDetail = async (req, res) => {
    const tweetId = req.params.id;

    try {
        // Find the tweet by ID
        const findTweet = await TweetModel.findById({ _id: tweetId });
        if (!findTweet) {
            return res.status(500).json({ message: "Tweet not found!" });
        }

        return res.status(200).json({ message: "Tweet found!", findTweet });
    } catch (error) {
        if (error.name === 'CastError') {
            return res.status(500).json({ message: "Invalid tweet ID format" });
        }
        return res.status(500).json({ message: "Error Occurred!" });
    }
}

// Function to get details of all tweets
const allTweetDetails = async (req, res) => {
    try {
        // Find all tweets and sort them by creation date
        const findAllTweets = await TweetModel.find();
        if (!findAllTweets) {
            return res.status(500).json({ message: "No Tweets found!" });
        }

        const sortTweets = await findAllTweets.sort((a, b) => b.createdAt - a.createdAt);
        if (!sortTweets) {
            return res.status(500).json({ message: "Tweets not sorted!" });
        }

        return res.status(200).json({ message: "All Tweets Found!", sortTweets });
    } catch (error) {
        return res.status(500).json({ message: "Error Occurred!", error });
    }
}

// Find all tweets and sort them by creation date
const deleteTweet = async (req, res) => {
    const tweetId = req.params.id;

    try {
        // Find the tweet to be deleted
        const findTweet = await TweetModel.findById({ _id: tweetId });
        if (!findTweet) {
            return res.status(500).json({ message: "Tweet not found!" });
        }

        // Check if the tweet is a reply
        if (findTweet.replies && findTweet.replies.length > 0) {
            // Loop through the replies of the tweet to find the reply to be deleted
            for (let i = 0; i < findTweet.replies.length; i++) {
                const replyId = findTweet.replies[i].tweetId;
                const replyTweet = await TweetModel.findById({ _id: replyId });
                // Check if the reply exists
                if (replyTweet) {
                    // Delete the reply
                    await replyTweet.deleteOne();
                }
            }
        }

        // Find tweets that have this tweet as a reply
        const tweetsWithReply = await TweetModel.find({ "replies.tweetId": tweetId });
        // Loop through the tweets and delete the reply from each of them
        for (const tweet of tweetsWithReply) {
            // Filter out the reply to be deleted
            tweet.replies = tweet.replies.filter(reply => reply.tweetId.toString() !== tweetId);
            // Save the updated tweet
            await tweet.save();
        }

        // Delete the original tweet
        const deleteTweet = await findTweet.deleteOne();
        if (!deleteTweet) {
            return res.status(500).json({ message: "Error while deleting tweet!" });
        }

        return res.status(200).json({ message: "Tweet and its replies deleted successfully!" });
    } catch (error) {
        return res.status(500).json({ message: "Error Occurred!", error });
    }
}

//Function for retweet
const retweet = async (req, res) => {
    const tweetId = req.params.id;

    try {
        // Find the tweet to be retweeted
        const findTweet = await TweetModel.findById({ _id: tweetId });
        if (!findTweet) {
            return res.status(500).json({ message: "Tweet not found!" });
        }

        // Check if the user has already retweeted the tweet
        const hasRetweeted = findTweet.retweetBy.includes(req.user._id);
        if (hasRetweeted) {
            return res.status(500).json({ message: "You have already retweeted this tweet!" });
        }

        // Add the user ID to the retweetBy array
        findTweet.retweetBy.push(req.user._id);

        // Save the updated tweet
        const updatedTweet = await findTweet.save();

        return res.status(200).json({ message: "Retweeted successfully!", updatedTweet });
    } catch (error) {
        return res.status(500).json({ message: "Error Occurred!", error });
    }
}



module.exports = {
    createTweet,
    likeTweet,
    dislikeTweet,
    replyOnTweet,
    singleTweetDetail,
    allTweetDetails,
    deleteTweet,
    retweet
}