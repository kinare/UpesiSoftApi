const productRestockModel = require('../../models/productModels/productRestockModel')
const productModel = require('../../models/productModels/productModel')
const userIdentityModel = require('../../models/userModels/userIdentityModel')
const moment = require('moment')

exports.restockInitiate = function(req, res) {
    // Get params
    let businessId = req.userDetails.businessId
    let userId = req.userDetails.id
    let productId = req.body['id'] ? parseInt(req.body['id']) : null
    let restockQty = req.body['restockQty']
    let restockDate = req.body['restockDate'] ? req.body['restockDate'] : null

    let errorArray = []
    if(!businessId && !userId) {errorArray.push({name: 'businessId', text: 'Missing user token.'})}
    if(!productId) {errorArray.push({name: 'id', text: 'The product Id is missing.'})}
    if(!restockQty) {errorArray.push({name: 'restockQty', text: 'Please enter the restock quantity.'})}
    if(!restockDate) {errorArray.push({name: 'restockDate', text: 'Please enter the restock date.'})}

    if(errorArray.length > 0 ) {
        // If variables are missing
        return res.status(400).send({
            status: 'error',
            message: 'Request not fulfilled. There was some missing information.',
            data: {
                list: errorArray
            }
        })
    }

    // Get user details
    userIdentityModel.getUser(userId, null, function(userResponse) {
        if(userResponse) {
            // Get user permissions
            userIdentityModel.getUserPermissions(userResponse[0].userPermissionsId, function(userPermissionsResponse) {
                if(userPermissionsResponse) {
                    // Check if user can create
                    if(userPermissionsResponse[0].createProducts === 1) {
                        let restockData = {
                            businessId: businessId,
                            productId: productId,
                            restockQty: restockQty,
                            restockAvailableFrom: restockDate ? moment(restockDate, 'YYYY-MM-DD').format('YYYY-MM-DD HH:mm:ss') : null,
                            restockInitiatedBy: userId,
                            restockApprovedBy: userId,
                            restocked: 0,
                            restockCreatedAt: moment().format('YYYY-MM-DD HH:mm:ss'),
                            restockUpdatedAt: moment().format('YYYY-MM-DD HH:mm:ss')
                        }

                        productRestockModel.newRestockEntry(restockData, function(restockResponse) {
                            if(!restockResponse.error) {
                                // Compare restockAvailableFrom date and current date
                                if(moment(restockData.restockAvailableFrom).isAfter(restockData.restockCreatedAt)) {
                                    res.send({
                                        status: 'success',
                                        data: {
                                            restockId: restockResponse.insertId
                                        }
                                    })
                                } else {
                                    // Restock product
                                    exports.restockProduct(businessId, productId, restockResponse.insertId, restockQty, function(restockResponse) {
                                        if(restockResponse.error) {
                                            res.status(400).send({
                                                status: 'error',
                                                message: restockResponse.text ? restockResponse : 'The restock order was successfully inserted but there was an error updating your current stock. Kindly contact support for further assistance.'
                                            })
                                        } else {
                                            res.send({
                                                status: 'success',
                                                data: {
                                                    response: restockResponse
                                                }
                                            })
                                        }
                                    })
                                }
                            } else {
                                res.status(400).send({
                                    status: 'error',
                                    message: 'Could not perform action. User is not authorized.',
                                    sqlMessage: restockResponse.sqlMessage ? restockResponse.sqlMessage : 'There was an error inserting new product restock request.'
                                })
                            }
                        })
                    } else {
                        res.status(400).send({
                            status: 'error',
                            message: 'Could not perform action. User is not authorized.'
                        })
                    }
                } else {
                    res.status(400).send({
                        status: 'error',
                        message: 'Could not perform action. There was an error retrieving user permissions.'
                    })
                }
            })
        } else {
            res.status(400).send({
                status: 'error',
                message: 'Please login with a valid user. User trying to perform action not found.'
            })
        }
    })
}

exports.restockProduct = function(businessId = null, productId = null, restockId = null, restockQty = null, callback) {
    // Getting product details
    productModel.getProduct(businessId, productId, function(productResponse) {
        if(!productResponse.error && productResponse && productResponse.length > 0) {
            // Product update data
            let productUpdateData = {
                qty: productResponse[0].qty ? productResponse[0].qty : 0 + restockQty,
                updatedAt: moment().format('YYYY-MM-DD HH:mm:ss')
            }
        
            // Update product qty
            productModel.updateProduct(productId, productUpdateData, function(updateProductResponse) {
                console.log('UPDATE PRODUCT RESPONSE: ', updateProductResponse)
                if(updateProductResponse.affectedRows > 0) {
                    // Gather updated information
                    let restockUpdatedData = {
                        restocked: 1,
                        restockUpdatedAt: moment().format('YYYY-MM-DD HH:mm:ss')
                    }
        
                    // Update restock order
                    productRestockModel.updateRestockOrder(restockId, restockUpdatedData, function(restockUpdateResponse) {
                        if(restockUpdateResponse.affectedRows > 0) {
                            // Return success
                            callback(true)
                        } else {
                            // Error updating restock order
                            callback({
                                error: true,
                                text: 'The product quantity was updated but there was an error updating the restock order. Kindly contact support for further assistance.'
                            })
                        }
                    })
                } else {
                    // Error updating product
                    callback({
                        error: true,
                        text: 'There was an error updating the product quantity. Kindly contact support for further assistance.'
                    })
                }
            })
        } else {
            callback({
                error: true,
                text: productResponse.text ? productResponse.text : 'There was an error getting the product for a restock.'
            })
        }
    })
}
