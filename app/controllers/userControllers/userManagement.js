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
    let firstName = req.body['firstName']
    let lastName = req.body['lastName']
    let email = req.body['email']
    let password = req.body['password']
    let confirmPassword = req.body['confirmPassword']
    let userRoleId = req.body['userRoleId']
    let businessId = req.userDetails.businessId
    let profilePicture = req.file ? req.file : null

    // Check if required parameters have been passed
    let errorArray = []
    if(!firstName) {errorArray.push({name: 'firstName', text: 'Missing first name parameter.'})}
    if(!lastName) {errorArray.push({name: 'lastName', text: 'Missing last name parameter.'})}
    if(!email) {errorArray.push({name: 'email', text: 'Missing email parameter.'})}
    if(!password) {errorArray.push({name: 'password', text: 'Missing password parameter.'})}
    if(!confirmPassword) {errorArray.push({name: 'confirmPassword', text: 'Missing confirm password parameter.'})}
    if(!userRoleId) {errorArray.push({name: 'userRoleId', text: 'Missing role Id parameter.'})}
    if(!businessId) {errorArray.push({name: 'businessId', text: 'Missing business Id parameter.'})}
    if(password !== confirmPassword) {errorArray.push({name: 'confirmPassword', text: 'Passwords do not match. Please check.'})}

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

    // Insert product image
    const targetPath = path.normalize('/var/www/cdn.upesisoft.com/html/images/users/' + profilePicture.filename + path.extname(profilePicture.originalname).toLowerCase())
    const tempPath = profilePicture.path
    let userImageUrl = profilePicture ? 'https://cdn.upesisoft.com/images/users/' + profilePicture.filename + path.extname(profilePicture.originalname).toLowerCase() : null

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

    // Inserting user details
    let insertUserData = {
        firstName: firstName,
        lastName: lastName,
        email: email,
        password: bcrypt.hashSync(password, 10),
        roleId: userRoleId,
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
