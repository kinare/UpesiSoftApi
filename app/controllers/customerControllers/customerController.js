var customerModel = require('../../models/customerModels/customerModel')
var userIdentityModel = require('../../models/userModels/userIdentityModel')
const moment = require('moment')
const path = require('path')
const fs = require('fs')

exports.getAll = function(req, res) {
    // Checking all parameters are available
    let businessId = req.userDetails.businessId

    let errorArray = []
    if(!businessId) {errorArray.push({name: 'businessId', text: 'Missing user token.'})}

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

    // Proceed to get customer list
    customerModel.getAll(businessId, function(response) {
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
    let customerFirstName = req.body['customerFirstName']
    let customerLastName = req.body['customerLastName']
    let customerBusinessName = req.body['customerBusinessName']
    let customerEmail = req.body['customerEmail']
    let customerCountryCode = req.body['customerCountryCode']
    let customerPostalAddress = req.body['customerPostalAddress']
    let customerAddress = req.body['customerAddress']
    let customerPhoneNumber = req.body['customerPhoneNumber']
    let isBusiness = parseInt(req.body['isBusiness']) ? parseInt(req.body['isBusiness']) : 0
    let kraPin = req.body['kraPin']
    let customerProfilePicture = req.file ? req.file : null
    let initiateUserId = req.userDetails.id ? req.userDetails.id : null
    let customerId = req.body['customerId'] ? req.body['customerId'] : null

    let errorArray = []
    if(!businessId) {errorArray.push({name: 'businessId', text: 'Missing user token.'})}
    // Check if business
    if(isBusiness === 1) {
        if(!customerBusinessName) {errorArray.push({name: 'customerBusinessName', text: 'Missing business name.'})}
    } else {
        if(!customerFirstName) {errorArray.push({name: 'customerFirstName', text: 'Missing customer first name.'})}
        if(!customerLastName) {errorArray.push({name: 'customerLastName', text: 'Missing customer last name.'})}
    }
    // if(!customerEmail) {errorArray.push({name: 'customerEmail', text: 'Missing customer email.'})}
    if(!customerCountryCode) {errorArray.push({name: 'customerCountryCode', text: 'Missing country code.'})}
    if(!customerPhoneNumber) {errorArray.push({name: 'customerPhoneNumber', text: 'Missing phone number.'})}

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

    if(customerProfilePicture) {
        // Insert customer image
        const targetPath = path.normalize(process.env.IMAGES_UPLOAD_ROOT + 'images/customers/' + customerProfilePicture.filename + path.extname(customerProfilePicture.originalname).toLowerCase())
        const tempPath = customerProfilePicture.path
        var customerImageUrl = customerProfilePicture ? process.env.CDN_URL + 'images/customers/' + customerProfilePicture.filename + path.extname(customerProfilePicture.originalname).toLowerCase() : null

        // Update customer Image path name
        if (path.extname(customerProfilePicture.originalname).toLowerCase()) {
            fs.rename(tempPath, targetPath, err => {
                console.log(err ? err : 'Successfully updated customer image path. Image uploaded successfully.')
            });
        } else {
            fs.unlink(tempPath, err => {
                console.log(err ? err : 'There was an error unlinking customer image path. Image not successfully updated.')
            });
        }
    }
    
    // Get delete user details
    userIdentityModel.getUser(initiateUserId, null, function(userResponse) {
        if(userResponse) {
            // Get user permissions
            userIdentityModel.getUserPermissions(userResponse[0].userPermissionsId, function(userPermissionsResponse) {
                if(userPermissionsResponse) {
                    // Check if insert or update
                    if(customerId) {
                        // Do update
                        // Check if user has the permissions to do so
                        if(userPermissionsResponse[0].editCustomers === 1) {
                            // TODO: Update
                            let updateData = {}

                            // Check params and push them to array
                            if(customerFirstName)
                                updateData.customerFirstName = customerFirstName
                            if(customerLastName)
                                updateData.customerLastName = customerLastName
                            if(customerEmail)
                                updateData.customerEmail = customerEmail
                            if(customerBusinessName)
                                updateData.customerBusinessName = customerBusinessName
                            if(customerAddress)
                                updateData.customerAddress = customerAddress
                            if(customerCountryCode)
                                updateData.customerCountryCode = customerCountryCode
                            if(customerPhoneNumber)
                                updateData.customerPhoneNumber = customerPhoneNumber
                            if(customerImageUrl)
                                updateData.customerProfilePicture = customerImageUrl
                            if(customerPostalAddress)
                                updateData.customerPostalAddress = customerPostalAddress
                            if(kraPin)
                                updateData.kraPin = kraPin
                            if(isBusiness)
                                updateData.isBusiness = isBusiness

                            // Update data
                            updateData.updatedAt = moment().format('YYYY-MM-DD HH:mm:ss')

                            let updateVariable = {
                                name: 'id',
                                value: customerId
                            }

                            // Run update
                            customerModel.updateCustomer(updateVariable, updateData, function(customerUpdateResponse) {
                                if(customerUpdateResponse.affectedRows > 0) {
                                    res.send({
                                        status: 'success',
                                        data: null
                                    })
                                } else {
                                    res.status(400).send({
                                        status: 'error',
                                        message: 'There was are error updating customer details. Please try again or contact the support team if the issue persists.',
                                        sqlMessage: customerUpdateResponse.sqlMessage ? customerUpdateResponse.sqlMessage : null
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
                        // Create new customer
                        // Check if user has the permission to do so
                        if(userPermissionsResponse[0].createCustomers === 1) {
                            let insertData = {
                                businessId: businessId,
                                customerFirstName: customerFirstName ? customerFirstName : null,
                                customerLastName: customerLastName ? customerLastName : null,
                                customerBusinessName: customerBusinessName ? customerBusinessName : null,
                                customerEmail: customerEmail ? customerEmail : null,
                                customerCountryCode: customerCountryCode,
                                customerPostalAddress: customerPostalAddress ? customerPostalAddress : null,
                                customerAddress: customerAddress ? customerAddress : null,
                                customerPhoneNumber: customerPhoneNumber,
                                kraPin: kraPin ? kraPin : null,
                                customerProfilePicture: customerImageUrl ? customerImageUrl : null,
                                isBusiness: isBusiness ? isBusiness : typeof isBusiness === "number" ? isBusiness : 0,
                                createdAt: moment().format('YYYY-MM-DD HH:mm:ss'),
                                updatedAt: moment().format('YYYY-MM-DD HH:mm:ss')
                            }

                            customerModel.addNew(insertData, function(response) {
                                // Check if customer details were inserted
                                if(!response.error) {
                                    res.send({
                                        status: 'success',
                                        data: null
                                    })

                                } else {
                                    // Return error
                                    res.status(400).send({
                                        status: 'error',
                                        message: response.text ? response.text : 'There was an error creating the customer. Please try again or contact support if the issue persists.',
                                        sqlMessage: response.sqlMessage ? response.sqlMessage : null
                                    })
                                }        
                            })
                        } else {
                            res.status(400).send({
                                status: 'error',
                                message: 'Could not perform action. User is not authorized.'
                            })
                        }
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

exports.deleteCustomer = function(req, res) {
    // Get params
    let businessId = req.userDetails.businessId ? req.userDetails.businessId : null
    let customerId = parseInt(req.body['customerId']) ? parseInt(req.body['customerId']) : null
    let deleteInitiateUserId = req.userDetails.id ? req.userDetails.id : null

    // Check if required parameters have been passed
    let errorArray = []
    if(!businessId) {errorArray.push({name: 'businessId', text: 'Missing user token.'})}
    if(!customerId) {errorArray.push({name: 'customerId', text: 'Missing customer Id.'})}

    if(errorArray.length > 0 ) {
        // If variables are missing
        return res.status(400).send({
            status: 'error',
            message: 'Missing required parameters in the request.',
            data: {
                list: errorArray
            }
        })
    }

    // Check if user has delete permissions
    // Get delete user details
    userIdentityModel.getUser(deleteInitiateUserId, null, function(userResponse) {
        if(userResponse) {
            // Get user permissions
            userIdentityModel.getUserPermissions(userResponse[0].userPermissionsId, function(userPermissionsResponse) {
                if(userPermissionsResponse) {
                    // Check if user can delete
                    if(userPermissionsResponse[0].deleteCustomers === 1) {
                        // Delete customer
                        let updateData = {
                            state: 0,
                            updatedAt: moment().format('YYYY-MM-DD HH:mm:ss')
                        }
                        
                        let updateVariables = {
                            id: customerId,
                            businessId: businessId
                        }

                        customerModel.deleteCustomer(updateVariables, updateData, function(deleteCustomerResponse) {
                            if(deleteCustomerResponse.affectedRows) {
                                res.send({
                                    status: 'success',
                                    data: null
                                })
                            } else {
                                res.status(400).send({
                                    status: 'error',
                                    message: 'There was an error deleting the customer. Please make sure that the customer exists and try again.'
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
