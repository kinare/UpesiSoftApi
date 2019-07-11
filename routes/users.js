var express = require('express')
var router = express.Router()
var userController = require('../app/controllers/userControllers/userController')
const userManagement = require('../app/controllers/userControllers/userManagement')

// User Account Management - Global
router.post('/v1/users/login', userController.login);
router.post('/v1/users/signup', userController.signup);
router.post('/v1/users/activate', userController.activate);
router.post('/v1/users/reset/initiate', userController.resetInitiate);
router.post('/v1/users/reset/complete', userController.resetComplete);

// User Management Routes - Business
router.post('/v1/b/users/create', userController.verifyUserToken, userManagement.createUser)
router.post('/v1/b/roles/create', userController.verifyUserToken, userManagement.createRole)

module.exports = router;
