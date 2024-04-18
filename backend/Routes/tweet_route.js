const express = require('express');
const authenticate = require('../Middlewares/protectedRoute');
const { createTweet, likeTweet, dislikeTweet, replyOnTweet, singleTweetDetail, allTweetDetails, deleteTweet, retweet } = require('../Controllers/tweet_controller');
const upload = require('../Middlewares/uploadImageRoute');
const router = express.Router();

router.post('/', authenticate, upload.single('image'), createTweet);
router.put('/:id/like', authenticate, likeTweet);
router.put('/:id/dislike', authenticate, dislikeTweet);
router.post('/:id/reply', authenticate, replyOnTweet);
router.get('/:id', singleTweetDetail);
router.get('/', allTweetDetails);
router.delete('/:id', authenticate, deleteTweet);
router.post('/:id/retweet', authenticate, retweet);

module.exports = router;