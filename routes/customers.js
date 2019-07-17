var express = require('express');
var router = express.Router();
const userController = require('../app/controllers/userControllers/userController')
const customerController = require('../app/controllers/customerControllers/customerController')

router.get('/v1/customers/get/all', userController.verifyUserToken, customerController.getAll)
router.post('/v1/customers/new', userController.verifyUserToken, customerController.new)

module.exports = router;
