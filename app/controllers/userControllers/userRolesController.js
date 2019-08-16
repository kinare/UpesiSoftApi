const userManagementModel = require('../../models/userModels/userManagementModel')
const userIdentityModel = require('../../models/userModels/userIdentityModel')
const moment = require('moment')

// Create new user role - set up permissions and user role details
exports.createRole = function(req, res) {
    // Getting parameters
    let roleName = req.body['roleName']
    let businessId = req.userDetails.businessId
    let roleDescription = req.body['roleDescription']
    let initiateUserId = req.userDetails.id ? req.userDetails.id : null
    let roleId = parseInt(req.body['id']) ? parseInt(req.body['id']) : null

    // Getting permissions
    let createUsers = req.body['createUsers']
    let editUsers = req.body['editUsers']
    let viewUsers = req.body['viewUsers']
    let deleteUsers = req.body['deleteUsers']
    let createUserRoles = req.body['createUserRoles']
    let viewUserRoles = req.body['viewUserRoles']
    let deleteUserRoles = req.body['deleteUserRoles']
    let editUserRoles = req.body['editUserRoles']
    let createProducts = req.body['createProducts']
    let editProducts = req.body['editProducts']
    let viewProducts = req.body['viewProducts']
    let deleteProducts  = req.body['deleteProducts']
    let createCustomers = req.body['createCustomers']
    let editCustomers = req.body['editCustomers']
    let viewCustomers = req.body['viewCustomers']
    let deleteCustomers  = req.body['deleteCustomers']
    let makeSales = req.body['makeSales']
    let viewSales = req.body['viewSales']
    let state = parseInt(req.body['state']) !== undefined ? parseInt(req.body['state']) : null

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

    // Get user details
    userIdentityModel.getUser(initiateUserId, null, function(userResponse) {
        if(userResponse) {
            // Get user permissions
            userIdentityModel.getUserPermissions(userResponse[0].userPermissionsId, function(userPermissionsResponse) {
                if(userPermissionsResponse) {
                    // Check if insert or update
                    if(!roleId) {
                        // Check if user can create
                        if(userPermissionsResponse[0].createUserRoles === 1) {
                            // Storing permissions first
                            let userPermissions = {
                                createUsers: createUsers ? createUsers : 0,
                                editUsers: editUsers ? editUsers : 0,
                                viewUsers: viewUsers ? viewUsers : 0,
                                deleteUsers: deleteUsers ? deleteUsers : 0,
                                createProducts: createProducts ? createProducts : 0,
                                editProducts: editProducts ? editProducts : 0,
                                viewProducts: viewProducts ? viewProducts : 0,
                                deleteProducts: deleteProducts ? deleteProducts : 0,
                                createUserRoles: createUserRoles ? createUserRoles : 0,
                                viewUserRoles: viewUserRoles ? viewUserRoles : 0,
                                deleteUserRoles: deleteUserRoles ? deleteUserRoles : 0,
                                editUserRoles: editUserRoles ? editUserRoles : 0,
                                createCustomers: createCustomers ? createCustomers : 0,
                                editCustomers: editCustomers ? editCustomers : 0,
                                viewCustomers: viewCustomers ? viewCustomers : 0,
                                deleteCustomers: deleteCustomers ? deleteCustomers : 0,
                                makeSales: makeSales ? makeSales : 0,
                                viewSales: viewSales ? viewSales : 0,
                                createdAt: moment().format('YYYY-MM-DD HH:mm:ss'),
                                updatedAt: moment().format('YYYY-MM-DD HH:mm:ss')
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
                        } else {
                            res.status(400).send({
                                status: 'error',
                                message: 'Could not perform action. User is not authorized.'
                            })
                        }
                    } else {
                        // Check if user can edit
                        if(userPermissionsResponse[0].editUserRoles === 1) {
                            // Get role based on ID
                            userManagementModel.getUserRole(roleId, businessId, function(response) {
                                if(!response.error && response.length > 0) {
                                    // Update permissions; Check which permissions were updated
                                    let userPermissions = {}

                                    if(createUsers)
                                        userPermissions.createUsers = createUsers
                                    if(editUsers)
                                        userPermissions.editUsers = editUsers
                                    if(viewUsers)
                                        userPermissions.viewUsers = viewUsers
                                    if(deleteUsers)
                                        userPermissions.deleteUsers = deleteUsers
                                    if(createProducts)
                                        userPermissions.createProducts = createProducts
                                    if(editProducts)
                                        userPermissions.editProducts = editProducts
                                    if(viewProducts)
                                        userPermissions.viewProducts = viewProducts
                                    if(deleteProducts)
                                        userPermissions.deleteProducts = deleteProducts
                                    if(createUserRoles)
                                        userPermissions.createUserRoles = createUserRoles
                                    if(viewUserRoles)
                                        userPermissions.viewUserRoles = viewUserRoles
                                    if(deleteUserRoles)
                                        userPermissions.deleteUserRoles = deleteUserRoles
                                    if(editUserRoles)
                                        userPermissions.editUserRoles = editUserRoles
                                    if(createCustomers)
                                        userPermissions.createCustomers = createCustomers
                                    if(editCustomers)
                                        userPermissions.editCustomers = editCustomers
                                    if(viewCustomers)
                                        userPermissions.viewCustomers = viewCustomers
                                    if(deleteCustomers)
                                        userPermissions.deleteCustomers = deleteCustomers
                                    if(makeSales)
                                        userPermissions.makeSales = makeSales
                                    if(viewSales)
                                        userPermissions.viewSales = viewSales
                                    
                                    // Update date
                                    userPermissions.updatedAt = moment().format('YYYY-MM-DD HH:mm:ss')

                                    // Update user permissions
                                    userManagementModel.updatePermissions(response[0].userPermissionsId, userPermissions, function(updatePermissionsResponse) {
                                        if(updatePermissionsResponse.affectedRows > 0) {
                                            // Insert User Category Details
                                            let userRoleDetails = {}

                                            if(roleName)
                                                userRoleDetails.roleName = roleName
                                                userRoleDetails.roleType = roleName.toLowerCase().replace(' ', '_')
                                                
                                            if(roleDescription)
                                                userRoleDetails.roleDescription = roleDescription

                                            if(state !== null)
                                                userRoleDetails.state = state

                                            userRoleDetails.updatedAt = moment().format('YYYY-MM-DD HH:mm:ss')
                                            
                                            // Insert Category Details
                                            userManagementModel.updateUserRole(response[0].userPermissionsId, businessId, userRoleDetails, function(updateRoleResponse) {
                                                if(updateRoleResponse.affectedRows > 0) {
                                                    // Return success
                                                    res.send({
                                                        status: 'success',
                                                        data: null
                                                    })
                                                } else {
                                                    // Error updating user role
                                                    res.status(400).send({
                                                        status: 'error',
                                                        message: 'There was an error updating user role. Please try again. If the issue persists, contact an administrator.',
                                                        sqlMessage: updateRoleResponse.sqlMessage ? updateRoleResponse.sqlMessage : null
                                                    })
                                                }
                                            })

                                        } else {
                                            // Error updating user permissions
                                            res.status(400).send({
                                                status: 'error',
                                                message: 'There was an error updating user permissions. Please try again. If the issue persists, contact an administrator.',
                                                sqlMessage: permissionsResponse.text
                                            })
                                        }
                                    })
                                } else {
                                    res.status(400).send({
                                        status: 'error',
                                        message: 'There was an error retrieving the user role for update. Please make sure the role exists.',
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