const express = require('express');
const router = express.Router();
const { login, applyCp } = require('./auth.controller');

router.post('/login', login);
router.post('/cp/apply', applyCp);

module.exports = router;
