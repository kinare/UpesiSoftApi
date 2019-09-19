const orderModel = require('../../models/orderModels/orderModel')
const moment = require('moment')
const productModel = require('../../models/productModels/productModel')
const orderEmailController = require('../orderControllers/orderEmailController')

exports.new = function(req, res) {
    // Get params
    let businessId = req.userDetails.businessId
    let userId = req.userDetails.id
    let customerId = req.body['customerId'] 
    let customerDetails = JSON.parse(req.body['customerDetails']) ? JSON.parse(req.body['customerDetails']) : null// An object
    let total = parseFloat(req.body['total']) ? parseFloat(req.body['total']) : 0.00
    let paymentMethod = req.body['paymentMethod']
    let orderType = req.body['orderType'] // Quoatation, Invoice, Order
    let orderStatus = req.body['orderStatus'] // Pending, Paid
    let orderItems = req.body['orderItems'] // An array of objects
    orderItems = JSON.parse(orderItems) ? JSON.parse(orderItems) : null
    let tendered = parseFloat(req.body['tendered']) ? parseFloat(req.body['tendered']) : 0.00
    let change = parseFloat(req.body['change']) ? parseFloat(req.body['change']) : 0.00

    // Checking all parameters are available
    let errorArray = []
    if(!businessId) {errorArray.push({name: 'businessId', text: 'Missing user token.'})}
    if(!userId) {errorArray.push({name: 'userId', text: 'Missing user token.'})}
    if(!total) {errorArray.push({name: 'total', text: 'Missing total price.'})}
    if(!paymentMethod) {errorArray.push({name: 'paymentMethod', text: 'Missing payment method.'})}
    if(!orderType) {errorArray.push({name: 'orderType', text: 'Missing order type.'})}
    if(!orderStatus) {errorArray.push({name: 'orderStatus', text: 'Missing order status.'})}
    if(!orderItems || orderItems.length < 1) {errorArray.push({name: 'orderItems', text: 'Missing order item information.'})}
    if(paymentMethod === 'CASH') {
        if(!tendered && typeof change !== 'number') {errorArray.push({name: 'tendered', text: 'Missing cash tendered value.'})}
        if(!change && typeof change !== 'number') {errorArray.push({name: 'change', text: 'Missing change value.'})}
    }

    if(errorArray.length > 0 ) {
        // If variables are missing
        return res.status(400).send({
            status: 'error',
            message: 'Missing parameters. Please check missing data list.',
            data: {
                list: errorArray
            }
        })
    }

    let orderDetails = {
        businessId: businessId,
        userId: userId,
        customerId: customerId ? customerId : null,
        customerDetails: null,
        total: total,
        tenderedAmount: tendered ? tendered : 0.00,
        changeAmount: change ? change : 0.00,
        paymentMethod: paymentMethod,
        orderType: orderType,
        orderStatus: orderStatus,
        createdAt: moment().format('YYYY-MM-DD HH:mm:ss'),
        updatedAt: moment().format('YYYY-MM-DD HH:mm:ss')
    }

    // Insert order details
    orderModel.newOrder(orderDetails, function(response) {
        // Check if successful
        if(!response.error) {
            // Loop over order items - array of objects
            let orderList = []

            // Loop into list
            orderItems.forEach(item => {
                // Check what type of product it is
                let insertOrderItemDetails = []

                if(item.sellAs === "CUSTOM") {
                    // Check if it has a primary product ID(primaryProductId)
                    if(item.primaryProductId) {
                        // Sell as sub product
                        // Required data: subProductId, productId, soldMeasurement
                        insertOrderItemDetails = [response.insertId,item.productId,item.subProductId,item.sellAs,null,parseFloat(item.soldMeasurement),parseFloat(item.measurementBefore),parseFloat(item.measurementAfter),parseFloat(item.price),1,moment().format('YYYY-MM-DD HH:mm:ss'),moment().format('YYYY-MM-DD HH:mm:ss')]

                        // Update product details i.e. update measurements & qty etc
                        // Update sub product details if orderType = ORDER
                        if(orderType === "ORDER") { 
                            // Get product details
                            productModel.getSubProduct(item.subProductId, function(subProductResponse) {
                                // If there is a product
                                if(!subProductResponse.error && subProductResponse) {
                                    // Update product details i.e. update measurements & qty etc
                                    // Check if measurement is equal or more than what is available
                                    if(parseFloat(subProductResponse[0].measurement) >= parseFloat(item.soldMeasurement)) {
                                        let subProductUpdateDetails = {
                                            measurement: parseFloat(item.measurementBefore) - parseFloat(item.soldMeasurement)
                                        }
                    
                                        // Update product
                                        productModel.updateSubProduct(item.subProductId, subProductUpdateDetails, function(updateSubProductResponse) {
                                            if(updateSubProductResponse.affectedRows > 0) {
                                                console.log('Sub product updated.')
                                            } else {
                                                console.log('Sub product not updated.')
                                            }
                                        })
                                    } else {
                                        console.log('The measurement sold is greater than the measurement available.')
                                    }
                                } else {
                                    console.log('There was no sub-product found with that ID.')
                                }
                            })
                        }
                    } else {
                        // If custom product being sold as full
                        insertOrderItemDetails = [response.insertId,item.productId,null,item.sellAs,item.qty,parseFloat(item.soldMeasurement),parseFloat(item.measurementBefore),parseFloat(item.measurementAfter),parseFloat(item.price),1,moment().format('YYYY-MM-DD HH:mm:ss'),moment().format('YYYY-MM-DD HH:mm:ss')]
    
                        if(orderType === "ORDER") { 
                            // Get product details
                            productModel.getProduct(null, item.productId, function(productResponse) {
                                // Check if full or custom
                                if(parseFloat(item.measurementAfter) === parseFloat(productResponse[0].measurement)) {
                                    console.log('Product being sold as full.')
                                    // If product has been sold as full
                                    // If there is a product
                                    if(!productResponse.error && productResponse) {
                                        // Update product details i.e. update measurements & qty etc
                                        // Check if qty exists
                                        if(productResponse[0].qty >= item.qty) {
                                            let productUpdateDetails = {
                                                qty: productResponse[0].qty - item.qty
                                            }
                        
                                            // Update product
                                            productModel.updateProduct(item.productId, productUpdateDetails, function(updateProductResponse) {
                                                if(updateProductResponse.affectedRows > 0) {
                                                    console.log('Product updated.')
                                                } else {
                                                    console.log('Product not updated.')
                                                }
                                            })
                                        } else {
                                            console.log('Product available qty is less than what is being sold.')
                                        }
                                    } else {
                                        console.log('There was no product found with that ID.')
                                    }
                                } else {
                                    console.log('Product being sold as CUSTOM. New sub products being created.')
                                    // If sale creates subProducts
                                    // Add new sub Products with remaining measurement
                                    // Get new sub products
                                    for(let xyz = 0; xyz < item.qty; xyz++) {
                                        // Add new subProduct
                                        let newSubProduct = [[item.productId,item.measurementAfter,item.measurementUnitId,1,moment().format('YYYY-MM-DD HH:mm:ss'),moment().format('YYYY-MM-DD HH:mm:ss')]]

                                        productModel.addSubProductList(newSubProduct, function(subProductInsertResponse) {
                                            if(subProductInsertResponse.insertId) {
                                                console.log('Sub product successfully inserted.')

                                            } else {
                                                // No sub-products inserted
                                                console.log(subProductInsertResponse.sqlMessage ? subProductInsertResponse.sqlMessage : 'There was an error creating a sub Product for order ' + response.insertId)
                                            }
                                        })
                                    }

                                    // Update main product - subtract qty
                                    let productUpdateDetails = {
                                        qty: productResponse[0].qty - item.qty
                                    }
                
                                    // Update product
                                    productModel.updateProduct(item.productId, productUpdateDetails, function(updateProductResponse) {
                                        if(updateProductResponse.affectedRows > 0) {
                                            console.log('Product updated.')
                                        } else {
                                            console.log('Product not updated.')
                                        }
                                    })
                                }
                            })
                        }
                    }                

                } else if(item.sellAs === "FULL") {
                    // If full, check: qty, productId
                    insertOrderItemDetails = [response.insertId,item.productId,null,item.sellAs,item.qty,null,null,null,parseFloat(item.price),1,moment().format('YYYY-MM-DD HH:mm:ss'),moment().format('YYYY-MM-DD HH:mm:ss')]
    
                    if(orderType === "ORDER") { 
                        // Get product details
                        productModel.getProduct(null, item.productId, function(productResponse) {
                            // If there is a product
                            if(!productResponse.error && productResponse) {
                                // Update product details i.e. update measurements & qty etc
                                // Check if qty exists
                                if(productResponse[0].qty >= item.qty) {
                                    let productUpdateDetails = {
                                        qty: productResponse[0].qty - item.qty
                                    }
                
                                    // Update product
                                    productModel.updateProduct(item.productId, productUpdateDetails, function(updateProductResponse) {
                                        if(updateProductResponse.affectedRows > 0) {
                                            console.log('Product updated.')
                                        } else {
                                            console.log('Product not updated.')
                                        }
                                    })
                                } else {
                                    console.log('Product available qty is less than what is being sold.')
                                }
                            } else {
                                console.log('There was no product found with that ID.')
                            }
                        })
                    }
                } else {
                    console.log('Item sellAs value not recognized.')
                }

                orderList.push(insertOrderItemDetails)
            });

            // Inserting order items
            orderModel.insertOrderItems(orderList, function(itemsInsertResponse) {
                if(itemsInsertResponse.insertId) {
                    res.send({
                        status: 'success',
                        data: {
                            orderId: response.insertId
                        }
                    })
                } else {
                    // No order items inserted
                    res.status(400).send({
                        status: 'error',
                        message: 'There was an error inserting the order item list.',
                        sqlMessage: response.sqlMessage ? response.sqlMessage : null
                    })
                }
            })

        } else {
            // Return error
            res.status(400).send({
                status: 'error',
                message: response.text,
                sqlMessage: response.sqlMessage ? response.sqlMessage : null
            })
        }
    })    
}

exports.getOrders = function(req, res) {
    // Get by type, ID etc
    // Get params
    let businessId = req.userDetails.businessId
    let orderType = req.query.orderType ? req.query.orderType : null
    let orderId = req.query.orderId ? req.query.orderId : null
    let orderStatus = req.query.orderStatus ? req.query.orderStatus : null
    let from = req.query.from ? req.query.from : null // Format 2019-08-18 05:30:20 Y-m-d H:i:s
    let to = req.query.to ? req.query.to : null // Format 2019-08-18 05:30:20 Y-m-d H:i:s

    // Checking all parameters are available
    let errorArray = []
    if(!businessId) {errorArray.push({name: 'businessId', text: 'Missing user token.'})}

    if(errorArray.length > 0 ) {
        // If variables are missing
        return res.status(400).send({
            status: 'error',
            message: 'Missing parameters. Please check the missing data list.',
            data: {
                list: errorArray
            }
        })
    }

    // Get order(s)
    orderModel.getOrders(businessId, orderType, orderId, orderStatus, from, to, function(getOrdersResponse) {
        if(!getOrdersResponse.error) {
            // Loop over orders and get individual order items
            let ordersCount = getOrdersResponse.length ? getOrdersResponse.length : 0
            let finalOrdersList = []

            for(let jy = 0; jy < ordersCount; jy++) {
                // Get order items
                orderModel.getOrderItems(getOrdersResponse[jy].id, function(getOrderItemsResponse){
                    // Check if there are order items returned
                    if(!getOrderItemsResponse.error) {
                        getOrdersResponse[jy].orderItems = getOrderItemsResponse
                        finalOrdersList.push(getOrdersResponse[jy])
                    }

                    if((jy + 1) === ordersCount) {
                        res.send({
                            status: 'success',
                            data: finalOrdersList
                        })
                    }
                })
            }

        } else {
            res.status(400).send({
                status: 'error',
                message: getOrdersResponse.text ? getOrdersResponse.text : 'There were no orders found.',
                sqlMessage: getOrdersResponse.sqlMessage ? getOrdersResponse.sqlMessage : null
            })
        }
    })
}

exports.convertOrder = function(req, res) {
    // Get details
    let businessId = req.userDetails.businessId
    let orderId = req.body['orderId'] ? parseInt(req.body['orderId']) : null
    let userId = req.userDetails.id
    let withEmail = req.body['withEmail'] ? req.body['withEmail'] : null

    // Checking all parameters are available
    let errorArray = []
    if(!businessId) {errorArray.push({name: 'businessId', text: 'Missing user token.'})}
    if(!orderId) {errorArray.push({name: 'orderId', text: 'Missing Order Id.'})}
    if(!userId) {errorArray.push({name: 'userId', text: 'Missing User Id.'})}

    if(errorArray.length > 0 ) {
        // If variables are missing
        return res.status(400).send({
            status: 'error',
            message: 'Missing parameters. Please check the missing data list.',
            data: {
                list: errorArray
            }
        })
    }

    // Get order details
    orderModel.getOrders(businessId, null, orderId, null, null, null, function(orderResponse) {
        if(!orderResponse.error && orderResponse.length > 0) {
            console.log(orderResponse)
            exports.updateOrderStock(orderResponse[0]).then((response) => {
                // Check for the type of conversion
                // Initiate conversion
                let updatedDetails = {
                    updatedAt: moment().format('YYYY-MM-DD HH:mm:ss')
                }
    
                let updateVariable = {
                    name: 'id',
                    value: orderId
                }
    
                if(orderResponse[0].orderType === 'QUOTE') {
                    // Update to Invoice
                    updatedDetails.orderType = 'INVOICE';
    
                } else if(orderResponse[0].orderType === 'INVOICE') {
                    // Update to Invoice
                    updatedDetails.orderType = 'ORDER'
                    updatedDetails.paymentMethod = 'CASH'
                    updatedDetails.orderStatus = 'PAID'
    
                } else {
                    return res.status(400).send({
                        status: 'error',
                        message: 'The order could not be updated because of the order type. This only works for quotes and invoices.'
                    })
                }
    
                // Run update
                orderModel.updateOrder(updateVariable, updatedDetails, function(updateOrderResponse) {
                    if(updateOrderResponse.affectedRows > 0) {
                        // Check whether to send email after update
                        if(withEmail === 'yes') {
                            // Send email
                            orderEmailController.customerOrderEmail(businessId, orderId, null, function(sendCustomerEmailResponse) {
                                if(!sendCustomerEmailResponse.error) {
                                    res.send({
                                        status: 'success',
                                        data: {
                                            emailResponse: sendCustomerEmailResponse,
                                            updateDetails: updateOrderResponse
                                        }
                                    })
                                } else {
                                    res.status(400).send({
                                        status: 'error',
                                        message: sendCustomerEmailResponse.text ? sendCustomerEmailResponse.text : 'There was an error sending the customer email. Order details were however updated.'
                                    })
                                }
                            })
                        } else {
                            res.send({
                                status: 'success',
                                data: {
                                    updateDetails: updateOrderResponse
                                }
                            })
                        }
                    } else {
                        res.status(400).send({
                            status: 'error',
                            message: updateOrderResponse.sqlMessage ? updateOrderResponse.sqlMessage : updateOrderResponse.text ? updateOrderResponse.text : 'There was an error updating the order. Please try again. If the issue persists, kindly contact support.'
                        })
                    }
                })
                
            }).catch((error) => {
                console.log(error)
                res.status(400).send({
                    status: 'error',
                    message: error.sqlMessage ? error.sqlMessage : error.text ? error.text : 'There was an error updating the order.'
                })
            })

        } else {
            res.status(400).send({
                status: 'error',
                message: orderResponse.sqlMessage ? orderResponse.sqlMessage : orderResponse.text ? orderResponse.text : 'There was an error retrieving the order.'
            })
        }
    })
}

/**
 * Update order items - for invoices & order 
 */
exports.updateOrderStock = function(orderDetails = null) {
    return new Promise((resolve, reject) => {
        // Process information the resolve or reject
        // Get order items
        if(orderDetails.orderType === 'INVOICE') {
            // Check sell as type
            orderModel.getOrderItems(orderDetails.id, function(orderItemsResponse) {
                if(!orderItemsResponse.error && orderItemsResponse.length > 0) {
                    orderItemsResponse.forEach(item => {
                        // Looping over items
                        if(item.sellAs === 'CUSTOM') {
                            if(item.subProductId) {
                                // Sell as sub-product
                                // Get sub-product details
                                productModel.getSubProduct(item.subProductId, function(subProductResponse) {
                                    // If there is a product
                                    if(!subProductResponse.error && subProductResponse) {
                                        // Update product details i.e. update measurements & qty etc
                                        // Check if measurement is equal or more than what is available
                                        if(parseFloat(subProductResponse[0].measurement) >= parseFloat(item.soldMeasurement)) {
                                            let subProductUpdateDetails = {
                                                measurement: parseFloat(item.measurementBefore) - parseFloat(item.soldMeasurement)
                                            }
                        
                                            // Update product
                                            productModel.updateSubProduct(item.subProductId, subProductUpdateDetails, function(updateSubProductResponse) {
                                                if(updateSubProductResponse.affectedRows > 0) {
                                                    console.log('Sub-product updated.')
                                                    resolve(true)
                                                } else {
                                                    console.log('Sub-product not updated.')
                                                    reject({
                                                        error: true,
                                                        text: updateSubProductResponse.text ? updateSubProductResponse.text : 'Sub-product not updated',
                                                        sqlMessage: updateSubProductResponse.sqlMessage ? updateSubProductResponse.sqlMessage : ''
                                                    })
                                                }
                                            })
                                        } else {
                                            console.log('The measurement sold is greater than the measurement available.')
                                            reject({
                                                error: true,
                                                text: 'The measurement sold is greater than the measurement available for order item - .' + item.id
                                            })
                                        }
                                    } else {
                                        console.log('There was no sub-product found with that ID.')
                                        reject({
                                            error: true,
                                            text: subProductResponse.text ? subProductResponse.text : 'There was no sub-product found with that ID.',
                                            sqlMessage: subProductResponse.sqlMessage ? subProductResponse.sqlMessage : ''
                                        })
                                    }
                                })
                            } else {
                                // Sell as full product
                                // Get product details
                                productModel.getProduct(null, item.productId, function(productResponse) {
                                    // Check if full or custom
                                    if(parseFloat(item.measurementAfter) === parseFloat(productResponse[0].measurement)) {
                                        console.log('Product being sold as full.')
                                        // If product has been sold as full
                                        // If there is a product
                                        if(!productResponse.error && productResponse) {
                                            // Update product details i.e. update measurements & qty etc
                                            // Check if qty exists
                                            if(productResponse[0].qty >= item.qty) {
                                                let productUpdateDetails = {
                                                    qty: productResponse[0].qty - item.qty
                                                }
                            
                                                // Update product
                                                productModel.updateProduct(item.productId, productUpdateDetails, function(updateProductResponse) {
                                                    if(updateProductResponse.affectedRows > 0) {
                                                        console.log('Product updated.')
                                                    } else {
                                                        console.log('Product not updated.')
                                                    }
                                                })
                                            } else {
                                                console.log('Product available qty is less than what is being sold.')
                                            }
                                        } else {
                                            console.log('There was no product found with that ID.')
                                        }
                                    } else {
                                        console.log('Product being sold as CUSTOM. New sub products being created.')
                                        // If sale creates subProducts
                                        // Add new sub Products with remaining measurement
                                        // Get new sub products
                                        for(let xyz = 0; xyz < item.qty; xyz++) {
                                            // Add new subProduct
                                            let newSubProduct = [[item.productId,item.measurementAfter,item.measurementUnitId,1,moment().format('YYYY-MM-DD HH:mm:ss'),moment().format('YYYY-MM-DD HH:mm:ss')]]
    
                                            productModel.addSubProductList(newSubProduct, function(subProductInsertResponse) {
                                                if(subProductInsertResponse.insertId) {
                                                    console.log('Sub product successfully inserted.')
    
                                                } else {
                                                    // No sub-products inserted
                                                    console.log(subProductInsertResponse.sqlMessage ? subProductInsertResponse.sqlMessage : 'There was an error creating a sub Product for order ' + response.insertId)
                                                }
                                            })
                                        }
    
                                        // Update main product - subtract qty
                                        let productUpdateDetails = {
                                            qty: productResponse[0].qty - item.qty
                                        }
                    
                                        // Update product
                                        productModel.updateProduct(item.productId, productUpdateDetails, function(updateProductResponse) {
                                            if(updateProductResponse.affectedRows > 0) {
                                                console.log('Product updated.')
                                            } else {
                                                console.log('Product not updated.')
                                            }
                                        })
                                    }
                                })
                            }
            
                        } else if(item.sellAs === 'FULL') {
                            // Get order items && update each
                            // Get product details
                            productModel.getProduct(null, item.productId, function(productResponse) {
                                // If there is a product
                                if(!productResponse.error && productResponse) {
                                    // Update product details i.e. update measurements & qty etc
                                    // Check if qty exists
                                    if(productResponse[0].qty >= item.qty) {
                                        let productUpdateDetails = {
                                            qty: productResponse[0].qty - item.qty
                                        }
                    
                                        // Update product
                                        productModel.updateProduct(item.productId, productUpdateDetails, function(updateProductResponse) {
                                            if(updateProductResponse.affectedRows > 0) {
                                                console.log('Product updated.')
                                                resolve(true)
                                            } else {
                                                console.log('Product not updated.')
                                                reject({
                                                    error: true,
                                                    text: updateProductResponse.text ? updateProductResponse.text : 'There was an error fetching order items.',
                                                    sqlMessage: updateProductResponse.sqlMessage ? updateProductResponse.sqlMessage : ''
                                                })
                                            }
                                        })
                                    } else {
                                        console.log('Product available qty is less than what is being sold.')
                                        reject({
                                            error: true,
                                            text: 'Product available qty is less than what is being sold for order item - ' + item.id
                                        })
                                    }
                                } else {
                                    console.log('There was no product found with that ID.')
                                    reject({
                                        error: true,
                                        text: productResponse.text ? productResponse.text : 'There was no product found with that ID.',
                                        sqlMessage: productResponse.sqlMessage ? productResponse.sqlMessage : ''
                                    })
                                }
                            })
            
                        } else {
                            console.log('Unknow order type or missing order type.')
                            reject({
                                error: true,
                                text: 'Unknow order type or missing order type.'
                            })
                        }                     
                    });
                } else {
                    reject({
                        error: true,
                        text: orderItemsResponse.text ? orderItemsResponse.text : 'There was an error fetching order items.',
                        sqlMessage: orderItemsResponse.sqlMessage ? orderItemsResponse.sqlMessage : ''
                    })
                }
            })
        } else {
            resolve(true)
        }
    })
}
