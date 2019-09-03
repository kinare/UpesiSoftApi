const orderModel = require('../../models/orderModels/orderModel')
const customerModel = require('../../models/customerModels/customerModel')
const sendMail = require('../../libraries/sendMail')
const Email = require('email-templates');
const email = new Email();

// Send receipt to customer trigger
exports.sendCustomerOrderEmail = function(req, res) {
    // Get params
    let businessId = req.userDetails.businessId
    let orderId = req.body['orderId']

    // Checking all parameters are available
    let errorArray = []
    if(!businessId) {errorArray.push({name: 'businessId', text: 'Missing user token. Please try again.'})}
    if(!orderId) {errorArray.push({name: 'orderId', text: 'Missing order Id.'})}

    if(errorArray.length > 0 ) {
        // If variables are missing
        return res.status(400).send({
            status: 'error',
            message: 'There was an error encountered. Some required information is missing.',
            data: {
                list: errorArray
            }
        })
    }

    // Send customer order email
    exports.customerOrderEmail(businessId, orderId, function(sendCustomerEmailResponse) {
        if(!sendCustomerEmailResponse.error) {
            res.send({
                status: 'success',
                data: null
            })
        } else {
            res.status(400).send({
                status: 'error',
                message: sendCustomerEmailResponse.text ? sendCustomerEmailResponse.text : 'There was an error sending the customer email.'
            })
        }
    })
}

// Send receipt to customer
exports.customerOrderEmail = function(businessId = null, orderId = null, callback) {
    // Get order details
    orderModel.getOrders(businessId, null, orderId, null, null, null, function(orderResponse) {
        if(!orderResponse.error) {
            // Get order items details
            orderModel.getOrderItems(orderResponse[0].id, function(getOrderItemsResponse){
                // Check if there are order items returned
                if(!getOrderItemsResponse.error) {
                    // Get customer details based on the order
                    customerModel.getCustomer(orderResponse[0].customerId, function(customerResponse) {
                        if(!customerResponse.error) {
                            // Send invoice as html
                            email
                                .render('orders/customerInvoice', {
                                    subject: process.env.BUSINESS_NAME + ' - Successful Order',
                                    orderDetails: orderResponse[0],
                                    orderItems: getOrderItemsResponse,
                                    customerDetails: customerResponse[0]
                                })
                                .then(res => {
                                    let mailOptions = {
                                        from: process.env.BUSINESS_NAME + ' <no-reply@upesisoft.com>',
                                        to: customerResponse[0].customerEmail,
                                        subject: process.env.BUSINESS_NAME + ' - Successful Order',
                                        html: res
                                    }
                
                                    sendMail.send(mailOptions, function(response) {
                                        // Check for email response
                                        if(!response.error) {
                                            callback(true)
                                        } else {
                                            callback({
                                                error: true,
                                                text: 'There was an error sending the email.',
                                                errorDetails: response.error
                                            })
                                        }
                                    })
                                })
                                .catch(err => {
                                    console.log(err)
                                    callback({
                                        error: true,
                                        text: 'There was an error getting the email template.',
                                        errorDetails: err
                                    })
                                })
                        } else {
                            callback({
                                error: true,
                                text: customerResponse.text ? customerResponse.text : 'There was an error fetching customer details. Email could not be sent.',
                                sqlMessage: customerResponse.sqlMessage ? customerResponse.sqlMessage : null
                            })
                        }
                    })

                } else {
                    callback({
                        error: true,
                        text: orderResponse.text ? orderResponse.text : 'There was an error fetching the order items.',
                        sqlMessage: orderResponse.sqlMessage ? orderResponse.sqlMessage : null
                    })
                }
            })

        } else {
            callback({
                error: true,
                text: orderResponse.text ? orderResponse.text : 'There was no order found there for could not send email.',
                sqlMessage: orderResponse.sqlMessage ? orderResponse.sqlMessage : null
            })
        }
    })
}

// Send invoice to customer

// Send quotation to customer
