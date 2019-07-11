const productModel = require('../../models/productModels/productModel')
const moment = require('moment')

exports.getAll = function(req, res) {
    // Checking all parameters are available
    let businessId = req.userDetails.businessId

    let errorArray = []
    if(!businessId) {errorArray.push({name: 'businessId', text: 'Missing user token.'})}

    if(errorArray.length > 0 ) {
        // If variables are missing
        return res.status(400).send({
            status: 'error',
            message: 'Missing user token. Please check request.',
            data: {
                list: errorArray
            }
        })
    }

    // Proceed to get product list
    productModel.getAll(businessId, function(response) {
        if(response.error) {
            res.status(400).send({
                status: 'error',
                message: response.text,
                sqlMessage: response.sqlMessage ? response.sqlMessage : null
            })
        } else {
            // Return response list
            res.send({
                status: 'success',
                data: response
            })
        }
    })
}

exports.new = function(req, res) {
    // Checking all parameters are available
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
    let measurementUnit = req.body['measurementUnit']
    let taxClassId = req.body['taxClassId']
    let published = req.body['published']

    let errorArray = []
    if(!businessId) {errorArray.push({name: 'businessId', text: 'Missing user token.'})}
    if(!productName) {errorArray.push({name: 'productName', text: 'Missing product name.'})}
    if(!productDescription) {errorArray.push({name: 'productDescription', text: 'Missing product description.'})}
    if(!productShortDescription) {errorArray.push({name: 'productShortDescription', text: 'Missing product short description.'})}
    if(!categories) {errorArray.push({name: 'categories', text: 'Missing product categories.'})}
    if(!price) {errorArray.push({name: 'price', text: 'Missing product price.'})}
    if(!measurementUnit) {errorArray.push({name: 'measurementUnit', text: 'Missing measurement unit.'})}
    if(!published) {errorArray.push({name: 'published', text: 'Missing published field.'})}

    if(errorArray.length > 0 ) {
        // If variables are missing
        return res.status(400).send({
            status: 'error',
            message: 'Missing user token. Please check request.',
            data: {
                list: errorArray
            }
        })
    }

    // Insert new product
    let insertData = {
        businessId: businessId,
        productName: productName,
        productDescription: productDescription,
        productShortDescription: productShortDescription,
        categories: categories,
        availableFrom: availableFrom ? availableFrom : null,
        availableTo: availableTo ? availableTo : null,
        sku: sku ? sku : null,
        price: price,
        salePrice: salePrice ? salePrice : null,
        measurementUnit: measurementUnit,
        taxClassId: taxClassId ? taxClassId : null,
        published: published,
        createdAt: moment().format('YYYY-MM-DD HH:mm:ss'),
        updatedAt: moment().format('YYYY-MM-DD HH:mm:ss')
    }

    productModel.addNew(insertData, function(response) {
        // Check if user details were inserted
        if(!response.error) {
            if(response.insertId) {
                res.send({
                    status: 'success',
                    data: null
                })
            } else {
                // No product inserted
                res.send({
                    status: 'error',
                    message: 'No new product was inserted.'
                })
            }
        } else {
            // Return error
            res.send({
                status: 'error',
                message: response.text,
                sqlMessage: response.sqlMessage ? response.sqlMessage : null
            })
        }        
    })
}
