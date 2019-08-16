const userManagementModel = require('../../models/userModels/userManagementModel')
const userController = require('./userController')
const userIdentityModel = require('../../models/userModels/userIdentityModel')
const bcrypt = require('bcryptjs')
const moment = require('moment')
const path = require('path')
const fs = require('fs')

// Create new user(under a business) - Tie them down to a user group(can be custom to that business)
exports.createUser = function(req, res) {
    // Get params
    let firstName = req.body['firstName'] ? req.body['firstName'] : null
    let lastName = req.body['lastName'] ? req.body['lastName'] : null
    let email = req.body['email'] ? req.body['email'] : null
    let password = req.body['password'] ? req.body['password'] : null
    let confirmPassword = req.body['confirmPassword'] ? req.body['confirmPassword'] : null
    let roleId = parseInt(req.body['roleId']) ? parseInt(req.body['roleId']) : null
    let businessId = req.userDetails.businessId ? req.userDetails.businessId : null
    let profilePicture = req.file ? req.file : null
    let userId = parseInt(req.body['id']) ? parseInt(req.body['id']) : null
    let phoneCountryCode = req.body['phoneCountryCode'] ? req.body['phoneCountryCode'] : null
    let userPhoneNumber = req.body['userPhoneNumber'] ? req.body['userPhoneNumber'] : null
    let initiateUserId = req.userDetails.id ? req.userDetails.id : null

    // Check if required parameters have been passed
    let errorArray = []
    if(!userId) {
        if(!firstName) {errorArray.push({name: 'firstName', text: 'Missing first name parameter.'})}
        if(!lastName) {errorArray.push({name: 'lastName', text: 'Missing last name parameter.'})}
        if(!email) {errorArray.push({name: 'email', text: 'Missing email parameter.'})}
        if(!password) {errorArray.push({name: 'password', text: 'Missing password parameter.'})}
        if(!confirmPassword) {errorArray.push({name: 'confirmPassword', text: 'Missing confirm password parameter.'})}
        if(!roleId) {errorArray.push({name: 'roleId', text: 'Missing role Id parameter.'})}
        if(!businessId) {errorArray.push({name: 'businessId', text: 'Missing business Id parameter.'})}
        if(password !== confirmPassword) {errorArray.push({name: 'confirmPassword', text: 'Passwords do not match. Please check.'})}
    }

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

    // Check if there is an image
    if(profilePicture) {
        // Insert user image
        const targetPath = path.normalize(process.env.IMAGES_UPLOAD_ROOT + 'images/users/' + profilePicture.filename + path.extname(profilePicture.originalname).toLowerCase())
        const tempPath = profilePicture.path
        var userImageUrl = profilePicture ? process.env.CDN_URL + 'images/users/' + profilePicture.filename + path.extname(profilePicture.originalname).toLowerCase() : null

        // Update user Image path name
        if (path.extname(profilePicture.originalname).toLowerCase()) {
            fs.rename(tempPath, targetPath, err => {
                console.log(err ? err : 'Successfully updated user image path. Image uploaded successfully.')
            });
        } else {
            fs.unlink(tempPath, err => {
                console.log(err ? err : 'There was an error unlinking user image path. Image not successfully updated.')
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
                    if(!userId) {
                        // Check if user can create
                        if(userPermissionsResponse[0].createUsers === 1) {
                            // Proceed with insert
                            // Inserting user details
                            let insertUserData = {
                                firstName: firstName,
                                lastName: lastName,
                                email: email,
                                phoneCountryCode: phoneCountryCode,
                                userPhoneNumber: userPhoneNumber,
                                password: bcrypt.hashSync(password, 10),
                                roleId: roleId,
                                businessId: businessId,
                                profilePicture: userImageUrl ? userImageUrl : null,
                                activationCode: Math.floor(100000 + Math.random() * 900000),
                                createdAt: moment().format('YYYY-MM-DD HH:mm:ss'),
                                updatedAt: moment().format('YYYY-MM-DD HH:mm:ss')
                            }

                            userIdentityModel.signup(insertUserData, function(userResponse) {
                                // Check if user details were inserted
                                if(userResponse.insertId) {
                                    userController.sendActivationEmail(insertUserData, function(activationEmailResponse) {
                                        // Parse activation email response
                                        if(activationEmailResponse.error) {
                                            // Return error message
                                            res.status(400).send({
                                                status: 'error',
                                                message: 'User successfully registered although the activation email was not send. Contact an administrator for assistance.'
                                            })
                                        } else {
                                            // Return success
                                            res.send({
                                                status: 'success',
                                                data: null
                                            })
                                        }
                                    })

                                } else {
                                    res.status(400).send({
                                        status: 'error',
                                        message: userResponse.text ? userResponse.text : 'There was an error inserting user details. Please try again. If the issue persists, contact an administrator.'
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
                        // Check if user can update/edit
                        if(userPermissionsResponse[0].editUsers === 1) {
                            // Do update
                            let updateObj = {}

                            // Check params and push them to array
                            if(firstName)
                                updateObj.firstName = firstName
                            if(lastName)
                                updateObj.lastName = lastName
                            if(email)
                                updateObj.email = email
                            if(password)
                                updateObj.password = bcrypt.hashSync(password, 10)
                            if(userPhoneNumber)
                                updateObj.userPhoneNumber = userPhoneNumber
                            if(phoneCountryCode)
                                updateObj.phoneCountryCode = phoneCountryCode
                            if(roleId)
                                updateObj.roleId = roleId
                            if(userImageUrl)
                                updateObj.profilePicture = userImageUrl

                            // Update data
                            updateObj.updatedAt = moment().format('YYYY-MM-DD HH:mm:ss')

                            let updateVariable = {
                                name: 'id',
                                value: userId
                            }

                            // Run update
                            userIdentityModel.updateUserDetails(updateVariable, updateObj, function(userUpdateResponse) {
                                if(userUpdateResponse.affectedRows > 0) {
                                    res.send({
                                        status: 'success',
                                        data: null
                                    })
                                } else {
                                    res.status(400).send({
                                        status: 'error',
                                        message: 'There was are error updating user details. Please try again or contact the support team if the issue persists.',
                                        sqlMessage: userUpdateResponse.sqlMessage ? userUpdateResponse.sqlMessage : null
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

// Get all users
exports.getAllUsers = function(req, res) {
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
    userManagementModel.getAllUsers(businessId, function(response) {
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

// Delete user
exports.deleteUser = function(req, res) {
    // Get params
    let businessId = req.userDetails.businessId ? req.userDetails.businessId : null
    let userId = parseInt(req.body['userId']) ? parseInt(req.body['userId']) : null
    let deleteInitiateUserId = req.userDetails.id ? req.userDetails.id : null

    // Check if required parameters have been passed
    let errorArray = []
    if(!businessId) {errorArray.push({name: 'businessId', text: 'Missing user token.'})}
    if(!userId) {errorArray.push({name: 'userId', text: 'Missing user Id.'})}

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

    // Check if the 2 users match
    if(userId === deleteInitiateUserId) {
        // If variables are missing
        return res.status(400).send({
            status: 'error',
            message: 'Cannot perform action. User being deleted is the same as the user performing the action.'
        })
    }

    // Check if user has delete permissions
    // Get user details
    userIdentityModel.getUser(deleteInitiateUserId, null, function(userResponse) {
        if(userResponse) {
            // Get user permissions
            userIdentityModel.getUserPermissions(userResponse[0].userPermissionsId, function(userPermissionsResponse) {
                if(userPermissionsResponse) {
                    // Check if user can delete
                    if(userPermissionsResponse[0].deleteUsers === 1) {
                        // Delete user
                        let updateData = {
                            state: 0,
                            updatedAt: moment().format('YYYY-MM-DD HH:mm:ss')
                        }
                        
                        let updateVariables = {
                            id: userId,
                            businessId: businessId
                        }

                        userManagementModel.deleteUser(updateVariables, updateData, function(deleteUserResponse) {
                            if(deleteUserResponse.affectedRows) {
                                res.send({
                                    status: 'success',
                                    data: null
                                })
                            } else {
                                res.status(400).send({
                                    status: 'error',
                                    message: 'There was an error deleting user. Please make sure the user exists and try again.'
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

    // TODO: Log user delete
}

// Get business types
exports.getBusinessTypes = function(req, res) {
    userManagementModel.getBusinessTypes(function(businessTypesResponse) {
        if(!businessTypesResponse.error) {
            res.send({
                status: 'success',
                data: {
                    businessTypes: businessTypesResponse
                }
            })
        } else {
            res.status(400).send({
                status: 'error',
                message: businessTypesResponse.text ? businessTypesResponse.text : 'There was an error retrieving business types. Please try again.',
                sqlMessage: businessTypesResponse.sqlMessage ? businessTypesResponse.sqlMessage : null
            })
        }
    })
}
