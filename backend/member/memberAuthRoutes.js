const express = require('express');
const { memberLogin } = require('./memberAuthController');

const router = express.Router();

router.post('/member/login', memberLogin);

module.exports = router;
