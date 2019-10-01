var express = require('express')
var router = express.Router()
var paymentPlanController = require('../app/controllers/paymentPlanControllers/paymentPlanController')

// Get all payment plans + their details
router.get('/v1/plans', paymentPlanController.getAll)

module.exports = router;
