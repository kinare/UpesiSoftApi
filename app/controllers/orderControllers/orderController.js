const orderModel = require('../../models/orderModels/orderModel')

exports.new = function(req, res) {
    // Get params
    let businessId = req.userDetails.businessId
    let productName = req.body['productName']
    let productDescription = req.body['productDescription']
    let productShortDescription = req.body['productShortDescription']
    let categories = req.body['categories']
    let availableFrom = req.body['availableFrom']
    let availableTo = req.body['availableTo']
    let sku = req.body['sku']
    let price = req.body['price']
    let salePrice = req.body['salePrice']
    let measurementUnitId = req.body['measurementUnitId']
    let taxClassId = req.body['taxClassId']
    let published = req.body['published']
    // New fields - Focus
    let storageLocation = req.body['storageLocation'] // aisle No. etc
    let sellAs = req.body['sellAs'] // CUSTOM or FULL
    let customSaleUnit = req.body['customSaleUnit'] // Only available if sellAs === CUSTOM
    let measurement = req.body['measurement']
    let qty = parseInt(req.body['qty']) ? parseInt(req.body['qty']) : 0 // Default - 0

    // Checking all parameters are available
    let errorArray = []
    if(!businessId) {errorArray.push({name: 'businessId', text: 'Missing user token.'})}
    if(!productName) {errorArray.push({name: 'productName', text: 'Missing product name.'})}
    if(!productDescription) {errorArray.push({name: 'productDescription', text: 'Missing product description.'})}
    if(!productShortDescription) {errorArray.push({name: 'productShortDescription', text: 'Missing product short description.'})}
    if(!categories) {errorArray.push({name: 'categories', text: 'Missing product categories.'})}
    if(!price) {errorArray.push({name: 'price', text: 'Missing product price.'})}
    if(!measurementUnitId) {errorArray.push({name: 'measurementUnitId', text: 'Missing measurement unit.'})}
    if(!published) {errorArray.push({name: 'published', text: 'Missing published field.'})}
    if(!sellAs) {errorArray.push({name: 'sellAs', text: 'Missing sellAs field.'})}
    // If sellAs === CUSTOM, check for customSaleUnit & measurement
    if(sellAs === 'CUSTOM') {
        if(!customSaleUnit) {errorArray.push({name: 'customSaleUnit', text: 'Missing customSaleUnit field.'})}
        if(!measurement) {errorArray.push({name: 'measurement', text: 'Missing measurement field.'})}
        // Check if number
        if(!qty && typeof qty == "number") {errorArray.push({name: 'qty', text: 'Missing quantity field or wrong datatype. Please enter a number.'})}    
    }

    if(errorArray.length > 0 ) {
        // If variables are missing
        return res.status(400).send({
            status: 'error',
            message: 'Missing parameters. Please check data list.',
            data: {
                list: errorArray
            }
        })
    }
    
}