var express = require('express');
var router = express.Router();
const userController = require('../app/controllers/userControllers/userController')
const productController = require('../app/controllers/productControllers/productController')

router.get('/v1/products/get/all', userController.verifyUserToken, productController.getAll)
router.post('/v1/products/new', userController.verifyUserToken, productController.new)

router.get('/v1/products/measurementUnits', userController.verifyUserToken, productController.getMeasurementUnits)

router.post('/v1/products/createCategory', userController.verifyUserToken, productController.createCategory)
router.get('/v1/products/categories', userController.verifyUserToken, productController.getAllCategories)

module.exports = router;
