const orderModel = require('../../models/orderModels/orderModel')
const moment = require('moment')
const productModel = require('../../models/productModels/productModel')

exports.new = function(req, res) {
    // Get params
    let businessId = req.userDetails.businessId
    let userId = req.userDetails.id
    let customerId = req.body['customerId'] 
    let customerDetails = JSON.parse(req.body['customerDetails']) ? JSON.parse(req.body['customerDetails']) : null// An object
    let total = req.body['total']
    let paymentMethod = req.body['paymentMethod']
    let orderType = req.body['orderType'] // Quoatation, Invoice, Order
    let orderStatus = req.body['orderStatus'] // Pending, Paid
    let orderItems = req.body['orderItems'] // An array of objects
    orderItems = JSON.parse(orderItems) ? JSON.parse(orderItems) : null
    let tendered = req.body['tendered']
    let change = req.body['change']

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
        if(!tendered) {errorArray.push({name: 'tendered', text: 'Missing cash tendered value.'})}
        if(!change) {errorArray.push({name: 'change', text: 'Missing change value.'})}
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
        customerDetails: customerDetails ? customerDetails : null,
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
                    // Required data: subProductId, productId, soldMeasurement
                    insertOrderItemDetails = [response.insertId,item.productId,item.subProductId,item.sellAs,null,item.soldMeasurement,item.measurementBefore,item.measurementAfter,item.price,1,moment().format('YYYY-MM-DD HH:mm:ss'),moment().format('YYYY-MM-DD HH:mm:ss')]

                    // Update product details i.e. update measurements & qty etc
                    // Update sub product details
                    // Get product details
                    productModel.getSubProduct(item.subProductId, function(subProductResponse) {
                        // If there is a product
                        if(!subProductResponse.error && subProductResponse) {
                            // Update product details i.e. update measurements & qty etc
                            let subProductUpdateDetails = {
                                measurement: item.measurementAfter
                            }
        
                            // Update product
                            productModel.updateSubProduct(item.subProductId, subProductUpdateDetails, function(updateSubProductResponse) {
                                if(updateSubProductResponse.affectedRows > 0) {
                                    console.log('Sub product updated.')
                                } else {
                                    console.log('Sub product not updated.')
                                }
                            })
                        }
                    })                    

                } else {
                    // If full, check: qty, productId
                    insertOrderItemDetails = [response.insertId,item.productId,null,item.sellAs,item.qty,null,null,null,item.price,1,moment().format('YYYY-MM-DD HH:mm:ss'),moment().format('YYYY-MM-DD HH:mm:ss')]

                    // Get product details
                    productModel.getProduct(item.productId, function(productResponse) {
                        // If there is a product
                        if(!productResponse.error && productResponse) {
                            // Update product details i.e. update measurements & qty etc
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
    orderModel.getOrders(businessId, orderType, orderId, orderStatus, function(getOrdersResponse) {
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
