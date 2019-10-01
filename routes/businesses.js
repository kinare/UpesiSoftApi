var express = require('express')
var router = express.Router()
const userController = require('../app/controllers/userControllers/userController')
const businessDetailsController = require('../app/controllers/businessControllers/businessDetailsController')
var multer = require('multer')
const upload = multer({
    dest: process.env.IMAGES_UPLOAD_ROOT + "images/businessLogos"
});

router.get('/v1/businesses/single', userController.verifyUserToken, businessDetailsController.get)
router.post('/v1/businesses/single', [userController.verifyUserToken, upload.single("businessLogoImage")], businessDetailsController.create)

/**
 * Organizations
 */
router.get('/v1/organization/businesses', userController.verifyUserToken, businessDetailsController.getAllOrganizationBusinesses)

module.exports = router;
