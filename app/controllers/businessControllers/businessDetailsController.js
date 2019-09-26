const moment = require('moment')
const businessAccountModel = require('../../models/businessModels/businessAccountModel')
const userIdentityModel = require('../../models/userModels/userIdentityModel')
const path = require('path')
const fs = require('fs')

/**
 * Get all business details
 */
exports.get = function(req, res) {
    // Get params
    let businessId = req.userDetails.businessId
    let initiateUserId = req.userDetails.id

    let errorArray = []
    if(!businessId) {errorArray.push({name: 'businessId', text: 'Missing user token.'})}
    if(!initiateUserId) {errorArray.push({name: 'initiateUserId', text: 'Missing user token.'})}

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

    // Get user details
    userIdentityModel.getUser(initiateUserId, null, function(userResponse) {
        if(userResponse) {
            // Get user permissions
            userIdentityModel.getUserPermissions(userResponse[0].userPermissionsId, function(userPermissionsResponse) {
                if(userPermissionsResponse) {
                    // Check if user can view
                    if(userPermissionsResponse[0].viewBusinessDetails === 1) {
                        // Get business details
                        businessAccountModel.getBusinessById(businessId, function(businessDetailsResponse) {
                            if(businessDetailsResponse) {
                                res.send({
                                    status: 'success',
                                    data: {
                                        businessDetails: businessDetailsResponse
                                    }
                                })
                            } else {
                                res.status(400).send({
                                    status: 'error',
                                    message: 'There was an error retrieving business details.'
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

exports.update = function(req, res) {
    // Get params
    // Checking all parameters are available
    let businessId = req.userDetails.businessId
    let initiateUserId = req.userDetails.id
    let businessName = req.body['businessName'] ? req.body['businessName'] : null
    let businessTypeId = req.body['businessTypeId'] ? req.body['businessTypeId'] : null
    let businessKraPin = req.body['businessKraPin'] ? req.body['businessKraPin'] : null
    let businessVatNumber = req.body['businessVatNumber'] ? req.body['businessVatNumber'] : null
    let businessCurrency = req.body['businessCurrency'] ? req.body['businessCurrency'] : null
    let businessCountryCode = req.body['businessCountryCode'] ? req.body['businessCountryCode'] : null
    let businessPhoneNumber = req.body['businessPhoneNumber'] ? req.body['businessPhoneNumber'] : null
    let businessCountry = req.body['businessCountry'] ? req.body['businessCountry'] : null
    let businessPhysicalAddress = req.body['businessPhysicalAddress'] ? req.body['businessPhysicalAddress'] : null
    let businessPostalAddress = req.body['businessPostalAddress'] ? req.body['businessPostalAddress'] : null
    let businessLogoImage = req.file ? req.file : null

    // Check for required information
    let errorArray = []
    if(!businessId) {errorArray.push({name: 'businessId', text: 'Missing user token.'})}
    if(!initiateUserId) {errorArray.push({name: 'initiateUserId', text: 'Missing user token.'})}

    if(businessLogoImage) {
        // Insert business logo image
        const targetPath = path.normalize(process.env.IMAGES_UPLOAD_ROOT + 'images/businessLogos/' + businessLogoImage.filename + path.extname(businessLogoImage.originalname).toLowerCase())
        const tempPath = businessLogoImage.path
        var businessLogoImageUrl = businessLogoImage ? process.env.CDN_URL + 'images/businessLogos/' + businessLogoImage.filename + path.extname(businessLogoImage.originalname).toLowerCase() : null

        console.log('Business logo image url: ' + typeof businessLogoImageUrl)

        // Update business logo image path name
        if (path.extname(businessLogoImage.originalname).toLowerCase()) {
            fs.rename(tempPath, targetPath, err => {
                console.log(err ? err : 'Successfully updated business logo image path. Image uploaded successfully.')
            });
        } else {
            fs.unlink(tempPath, err => {
                console.log(err ? err : 'There was an error unlinking business logo image path. Image not successfully updated.')
            });
        }
    }

    // Get user details
    userIdentityModel.getUser(initiateUserId, null, function(userResponse) {
        if(userResponse) {
            // Get user permissions
            userIdentityModel.getUserPermissions(userResponse[0].userPermissionsId, function(userPermissionsResponse) {
                if(userPermissionsResponse) {
                    // Check if user can update
                    if(userPermissionsResponse[0].editBusinessDetails === 1) {
                        // Gather updated information
                        let updatedData = {}

                        if(businessLogoImage)
                            updatedData.businessLogoImage = businessLogoImageUrl
                        if(businessName)
                            updatedData.businessName = businessName
                        if(businessTypeId)
                            updatedData.businessTypeId = businessTypeId
                        if(businessKraPin)
                            updatedData.businessKraPin = businessKraPin
                        if(businessVatNumber)
                            updatedData.businessVatNumber = businessVatNumber
                        if(businessCurrency)
                            updatedData.businessCurrency = businessCurrency
                        if(businessCountryCode)
                            updatedData.businessCountryCode = businessCountryCode
                        if(businessPhoneNumber)
                            updatedData.businessPhoneNumber = businessPhoneNumber
                        if(businessCountry)
                            updatedData.businessCountry = businessCountry
                        if(businessPhysicalAddress)
                            updatedData.businessPhysicalAddress = businessPhysicalAddress
                        if(businessPostalAddress)
                            updatedData.businessPostalAddress = businessPostalAddress

                        updatedData.updatedAt = moment().format('YYYY-MM-DD HH:mm:ss')

                        // Update business
                        businessAccountModel.update(businessId, updatedData, function(updateBusinessResponse) {
                            if(updateBusinessResponse.affectedRows > 0) {
                                // Return success
                                res.send({
                                    status: 'success',
                                    data: null
                                })
                            } else {
                                // Error updating business
                                res.status(400).send({
                                    status: 'error',
                                    message: 'There was an error updating business details. Please try again. If the issue persists, contact an administrator.',
                                    sqlMessage: updateBusinessResponse.sqlMessage ? updateBusinessResponse.sqlMessage : null
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
