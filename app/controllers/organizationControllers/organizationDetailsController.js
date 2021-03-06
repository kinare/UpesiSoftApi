var moment = require('moment')
const organizationDetailsModel = require('../../models/organizationModels/organizationDetailsModel')
const userIdentityModel = require('../../models/userModels/userIdentityModel')

/**
 * Create & update an organization's details
 * - Pass organization Id to update details
 */
exports.create = function(req, res) {
    return true
}

exports.delete = function(req, res) {
    return true
}

/**
 * Get all organization details
 */
exports.getDetails = function(req, res) {
    // Get params
    let organizationId = req.userDetails.organizationId ? req.userDetails.organizationId : null
    let initiateUserId = req.userDetails.id

    // Check for required information
    let errorArray = []
    if(!organizationId) {errorArray.push({name: 'organizationId', text: 'Missing user token.'})}
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
            userIdentityModel.getUserOrganizationPermissions(userResponse[0].userOrganizationPermissionsId, function(userOrganizationPermissionsResponse) {
                if(userOrganizationPermissionsResponse) {
                    // Check if user can view
                    if(userOrganizationPermissionsResponse[0].viewOrganizationDetails === 1) {
                        // Get details
                        organizationDetailsModel.getOrganizationById(organizationId, function(organizationDetailsResponse) {
                            if(!organizationDetailsResponse.error && organizationDetailsResponse) {
                                res.send({
                                    status: 'success',
                                    data: {
                                        organizationDetails: organizationDetailsResponse[0] ? organizationDetailsResponse[0] : null
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
