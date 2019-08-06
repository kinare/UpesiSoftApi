const userManagementModel = require('../../models/userModels/userManagementModel')
const userIdentityModel = require('../../models/userModels/userIdentityModel')
const moment = require('moment')

// Create new user role - set up permissions and user role details
exports.createRole = function(req, res) {
    // Getting parameters
    let roleName = req.body['roleName']
    let businessId = req.userDetails.businessId
    let roleDescription = req.body['roleDescription']

    // Getting permissions
    let createUsers = req.body['createUsers']
    let editUsers = req.body['editUsers']
    let viewUsers = req.body['viewUsers']
    let createProducts = req.body['createProducts']
    let editProducts = req.body['editProducts']
    let viewProducts = req.body['viewProducts']
    let makeSales = req.body['makeSales']

    // Check if required parameters have been passed
    let errorArray = []
    if(!roleName) {errorArray.push({name: 'roleName', text: 'Missing role name parameter.'})}
    if(!businessId) {errorArray.push({name: 'businessId', text: 'Missing business Id parameter.'})}

    if(errorArray.length > 0 ) {
        // If variables are missing
        return res.status(400).send({
            status: 'error',
            message: 'Missing parameters.',
            data: {
                list: errorArray
            }
        })
    }

    // Storing permissions first
    let userPermissions = {
        createUsers: createUsers ? createUsers : 0,
        editUsers: editUsers ? editUsers : 0,
        viewUsers: viewUsers ? viewUsers : 0,
        createProducts: createProducts ? createProducts : 0,
        editProducts: editProducts ? editProducts : 0,
        viewProducts: viewProducts ? viewProducts : 0,
        makeSales: makeSales ? makeSales : 0,
    }

    userManagementModel.savePermissions(userPermissions, function(permissionsResponse) {
        if(permissionsResponse.insertId) {
            // Insert User Category Details
            let userRoleDetails = {
                roleName: roleName,
                roleType: roleName.toLowerCase().replace(' ', '_'),
                roleDescription: roleDescription ? roleDescription : null,
                businessId: businessId,
                userPermissionsId: permissionsResponse.insertId,
                createdAt: moment().format('YYYY-MM-DD HH:mm:ss'),
                updatedAt: moment().format('YYYY-MM-DD HH:mm:ss')
            }

            // Insert Category Details
            userManagementModel.createUserRole(userRoleDetails, function(rolesResponse) {
                if(rolesResponse.insertId) {
                    // Return success
                    res.send({
                        status: 'success',
                        data: null
                    })

                } else {
                    // Error inserting user permissions
                    res.status(400).send({
                        status: 'error',
                        message: 'There was an error inserting new user role. Please try again. If the issue persists, contact an administrator.',
                        sqlMessage: rolesResponse.text
                    })
                }
            })

        } else {
            // Error inserting user permissions
            res.status(400).send({
                status: 'error',
                message: 'There was an error inserting user permissions. Please try again. If the issue persists, contact an administrator.',
                sqlMessage: permissionsResponse.text
            })
        }
    })
}

// Get all user roles
exports.getAllUserRoles = function(req, res) {
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

    // Proceed to get user list
    userManagementModel.getAllUserRoles(businessId, function(response) {
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

// Delete user roles
exports.deleteUserRole = function(req, res) {
    // Get params
    let businessId = req.userDetails.businessId ? req.userDetails.businessId : null
    let userRoleId = parseInt(req.body['userRoleId']) ? parseInt(req.body['userRoleId']) : null
    let deleteInitiateUserId = req.userDetails.id ? req.userDetails.id : null

    // Check if required parameters have been passed
    let errorArray = []
    if(!businessId) {errorArray.push({name: 'businessId', text: 'Missing user token.'})}
    if(!userRoleId) {errorArray.push({name: 'userRoleId', text: 'Missing User Role Id.'})}

    if(errorArray.length > 0) {
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
                    if(userPermissionsResponse[0].deleteUserRoles === 1) {
                        // Delete user role
                        let updateData = {
                            state: 0,
                            updatedAt: moment().format('YYYY-MM-DD HH:mm:ss')
                        }
                        
                        let updateVariables = {
                            id: userRoleId,
                            businessId: businessId
                        }

                        userManagementModel.deleteUserRole(updateVariables, updateData, function(deleteUserRoleResponse) {
                            if(deleteUserRoleResponse.affectedRows) {
                                res.send({
                                    status: 'success',
                                    data: null
                                })
                            } else {
                                res.status(400).send({
                                    status: 'error',
                                    message: 'There was an error deleting user role. Please make sure a user role with that ID exists and try again.'
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

    // TODO: Log user role delete
}