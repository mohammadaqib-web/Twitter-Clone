const express = require('express');
const { AddUser, LoginUser } = require('../Controllers/auth_controller');
const router = express.Router();

router.post('/register', AddUser);
router.post('/login', LoginUser);

module.exports = router;