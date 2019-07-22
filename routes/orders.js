var express = require('express');
var router = express.Router();
const userController = require('../app/controllers/userControllers/userController')
const orderController = require('../app/controllers/orderControllers/orderController')

router.get('/v1/orders/get', userController.verifyUserToken, orderController.getOrders)
router.post('/v1/orders/new', userController.verifyUserToken, orderController.new)

module.exports = router;
