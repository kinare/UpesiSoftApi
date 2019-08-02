var customerModel = require('../../models/customerModels/customerModel')
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

    // Insert product image
    const targetPath = path.normalize('/var/www/cdn.upesisoft.com/html/images/customers/' + customerProfilePicture.filename + path.extname(customerProfilePicture.originalname).toLowerCase())
    const tempPath = customerProfilePicture.path
    let customerImageUrl = customerProfilePicture ? 'https://cdn.upesisoft.com/images/customers/' + customerProfilePicture.filename + path.extname(customerProfilePicture.originalname).toLowerCase() : null

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

    // Insert new customer
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
                message: response.text,
                sqlMessage: response.sqlMessage ? response.sqlMessage : null
            })
        }        
    })
}
