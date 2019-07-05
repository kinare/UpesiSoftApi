var express = require('express');
var router = express.Router();
var userController = require('../app/controllers/userControllers/userController');

router.post('/v1/users/login', userController.login);
router.post('/v1/users/signup', userController.signup);
router.post('/v1/users/activate', userController.activate);
router.post('/v1/users/reset/initiate', userController.resetInitiate);
router.post('/v1/users/reset/complete', userController.resetComplete);

module.exports = router;
