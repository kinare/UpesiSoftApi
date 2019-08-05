var express = require('express')
var router = express.Router()
var userController = require('../app/controllers/userControllers/userController')
const userManagement = require('../app/controllers/userControllers/userManagement')
var multer = require('multer')
const upload = multer({
    dest: process.env.IMAGES_UPLOAD_ROOT + "images/users"
});

// User Account Management - Global
router.post('/v1/users/login', userController.login);
router.post('/v1/users/signup', userController.signup);
router.post('/v1/users/activate', userController.activate);
router.post('/v1/users/reset/initiate', userController.resetInitiate);
router.post('/v1/users/reset/complete', userController.resetComplete);

// User Management Routes - Business
// 1. Users
router.post('/v1/b/users/create', [userController.verifyUserToken, upload.single("profilePicture")], userManagement.createUser)
router.get('/v1/b/users/get', userController.verifyUserToken, userManagement.getAllUsers)
router.delete('/v1/b/user', userController.verifyUserToken, userManagement.deleteUser)

// 2. User Roles
router.post('/v1/b/roles/create', userController.verifyUserToken, userManagement.createRole)
router.get('/v1/b/roles/get', userController.verifyUserToken, userManagement.getAllUserRoles)
router.delete('/v1/b/role', userController.verifyUserToken, userManagement.deleteUserRole)

// 3. Businesses
router.get('/v1/b/businessTypes', userManagement.getBusinessTypes)


module.exports = router;
