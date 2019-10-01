var moment = require('moment')
const organizationBusinessesModel = require('../../models/organizationModels/organizationBusinessesModel')
const userIdentityModel = require('../../models/userModels/userIdentityModel')

exports.getAllUsers = function(req, res) {
    // Getting params
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
                    if(userOrganizationPermissionsResponse[0].viewUsers === 1) {
                        // Get details
                        organizationUsersModel.getAllUsers(organizationId, function(organizationUsersResponse) {
                            if(!organizationUsersResponse.error && organizationUsersResponse) {
                                res.send({
                                    status: 'success',
                                    data: {
                                        organizationUsers: organizationUsersResponse ? organizationUsersResponse : null
                                    }
                                })
                            } else {
                                res.status(400).send({
                                    status: 'error',
                                    message: 'There was an error retrieving organization users.'
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
