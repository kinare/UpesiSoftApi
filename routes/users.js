var express = require('express');
var router = express.Router();
var userController = require('../app/controllers/userController');

router.post('/v1/users/login', userController.login);

module.exports = router;
