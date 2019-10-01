var express = require('express');
var router = express.Router();
const userController = require('../app/controllers/userControllers/userController')
const organizationDetailsController = require('../app/controllers/organizationControllers/organizationDetailsController')
const organizationUsersController = require('../app/controllers/organizationControllers/organizationUsersController')

/**
 * Organization details
 */
router.get('/v1/organizations/single', userController.verifyUserToken, organizationDetailsController.getDetails)
router.post('/v1/organizations', userController.verifyUserToken, organizationDetailsController.create)

/**
 * Organization users
 */
router.get('/v1/organizations/users', userController.verifyUserToken, organizationUsersController.getAllUsers)

module.exports = router;
