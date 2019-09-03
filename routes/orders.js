var express = require('express');
var router = express.Router();
const userController = require('../app/controllers/userControllers/userController')
const orderController = require('../app/controllers/orderControllers/orderController')
const orderEmailController = require('../app/controllers/orderControllers/orderEmailController')

router.get('/v1/orders/get', userController.verifyUserToken, orderController.getOrders)
router.post('/v1/orders/new', userController.verifyUserToken, orderController.new)

// Order emails
router.post('/v1/orders/customer/email', userController.verifyUserToken, orderEmailController.sendCustomerOrderEmail)

// Convert orders from quote to invoice & from invoice to complete order.
// router.post('/v1/order/state/update', userController.verifyUserToken, productStockController.restockInitiate)

module.exports = router;
