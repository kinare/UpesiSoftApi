var express = require('express');
var router = express.Router();
const userController = require('../app/controllers/userControllers/userController')
const productController = require('../app/controllers/productControllers/productController')
const productStockController = require('../app/controllers/productControllers/productStockController')
const imageController = require('../app/controllers/imageControllers/imageController')
const productImportController = require('../app/controllers/productControllers/productImportController')
const productSalesController = require('../app/controllers/productControllers/productSalesController')
var multer = require('multer')
const upload = multer({
    dest: process.env.IMAGES_UPLOAD_ROOT + "images/products"
});

router.get('/v1/products/get/all', userController.verifyUserToken, productController.getAll)
router.post('/v1/products/new', [userController.verifyUserToken, upload.single("productImage")], productController.new)
router.delete('/v1/product', userController.verifyUserToken, productController.deleteProduct)

router.get('/v1/product/subProducts/all', userController.verifyUserToken, productController.getSubProducts)
router.delete('/v1/subProduct', userController.verifyUserToken, productController.deleteSubProduct)

// Get product sales
router.get('/v1/product/sales', userController.verifyUserToken, productSalesController.getProductSales)

router.get('/v1/products/measurementUnits', userController.verifyUserToken, productController.getMeasurementUnits)

router.post('/v1/products/createCategory', userController.verifyUserToken, productController.createCategory)
router.get('/v1/products/categories', userController.verifyUserToken, productController.getAllCategories)
router.delete('/v1/products/category', userController.verifyUserToken, productController.deleteCategory)

router.post('/v1/products/image/upload', [userController.verifyUserToken, upload.single("productImage")], imageController.uploadProductImage)

// Import products
router.post('v1/products/import', productImportController.import)

// Restock products
router.post('/v1/product/restock', userController.verifyUserToken, productStockController.restockInitiate)

module.exports = router;
