var express = require('express');
var router = express.Router();
const userController = require('../app/controllers/userControllers/userController')
const productController = require('../app/controllers/productControllers/productController')

router.get('/v1/products/get/all', userController.verifyUserToken, productController.getAll)
router.post('/v1/products/new', userController.verifyUserToken, productController.new)

module.exports = router;
