const express = require('express');
const { memberLogin, memberLoginLookup } = require('./memberAuthController');

const router = express.Router();

router.post('/member/login', memberLogin);
router.post('/member/login-lookup', memberLoginLookup);

module.exports = router;
