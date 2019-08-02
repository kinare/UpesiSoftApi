var express = require('express');
var router = express.Router();
const userController = require('../app/controllers/userControllers/userController')
const productController = require('../app/controllers/productControllers/productController')
const imageController = require('../app/controllers/imageControllers/imageController')
var multer = require('multer')
const upload = multer({
    dest: "/var/www/cdn.upesisoft.com/html/images"
});

router.get('/v1/products/get/all', userController.verifyUserToken, productController.getAll)
router.post('/v1/products/new', [userController.verifyUserToken, upload.single("productImage")], productController.new)

router.get('/v1/product/subProducts/all', userController.verifyUserToken, productController.getSubProducts)

router.get('/v1/products/measurementUnits', userController.verifyUserToken, productController.getMeasurementUnits)

router.post('/v1/products/createCategory', userController.verifyUserToken, productController.createCategory)
router.get('/v1/products/categories', userController.verifyUserToken, productController.getAllCategories)

router.post('/v1/products/image/upload', [userController.verifyUserToken, upload.single("productImage")], imageController.uploadProductImage)

module.exports = router;
