const express = require('express');
const { singleUserDetail, followUser, unfollowUser, editUserDetails, userTweets, uploadProfileImg, getAllUsers } = require('../Controllers/user_controller');
const authenticate = require('../Middlewares/protectedRoute');
const upload = require('../Middlewares/uploadImageRoute');
const router = express.Router();

router.get('/:id', singleUserDetail);
router.put('/:id/follow', authenticate, followUser);
router.put('/:id/unfollow', authenticate, unfollowUser);
router.put('/:id', authenticate, editUserDetails);
router.get('/:id/tweets', userTweets);
router.put('/:id/uploadProfilePic', authenticate, upload.single('image'), uploadProfileImg);
router.get('/', getAllUsers);

module.exports = router;