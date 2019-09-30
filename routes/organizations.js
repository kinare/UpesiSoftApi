var express = require('express');
var router = express.Router();
const userController = require('../app/controllers/userControllers/userController')
const organizationDetailsController = require('../app/controllers/organizationControllers/organizationDetailsController')

router.get('/v1/organizations/single', userController.verifyUserToken, organizationDetailsController.getDetails)
router.post('/v1/organizations/new', userController.verifyUserToken, organizationDetailsController.create)
router.post('/v1/organizations/update', userController.verifyUserToken, organizationDetailsController.create)

module.exports = router;
