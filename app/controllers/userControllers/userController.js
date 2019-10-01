let userIdentityModel = require('../../models/userModels/userIdentityModel')
let businessAccountsModel = require('../../models/businessModels/businessAccountModel')
let organizationDetailsModel = require('../../models/organizationModels/organizationDetailsModel')
let paymentPlansModel = require('../../models/paymentPlanModels/paymentPlansModel')
let sendMail = require('../../libraries/sendMail')
var moment = require('moment')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken');
const key = 'SFS234JKSP94RKS024NA052HOPQWR24'

exports.verifyUserToken = function(req, res, next) {
    try{
        const token = req.headers.authorization.split(" ")[1]
        jwt.verify(token, key, function (err, payload) {
            if(payload && payload.email) {
                // Get user based on the payload
                userIdentityModel.getUser(null, payload.email, function(response) {
                    // Check if the user exists
                    if(response && response.length > 0) {
                        req.userDetails = response[0]
                        next()
                    } else {
                        res.status(400).send({
                            status: 'error',
                            message: 'There was an error verifying the user. Please ensure that the token has not been tampered with.'
                        })
                    }
                })
            } else {
                res.status(400).send({
                    status: 'error',
                    message: 'There was an error verifying the user. Please ensure that the token has not been tampered with.'
                })
            }
        })
    }catch(e){
        res.status(400).send({
            status: 'error',
            message: 'There was an error verifying the user. Please ensure that the token has not been tampered with.'
        })
    }
}

exports.login = function(req, res) {
    // Get request parameters
    let email = req.body['email']
    let password = req.body['password']
    
    // Check if required variables have been passed
    let errorArray = []
    if(!email) {errorArray.push({name: 'email', text: 'Missing email parameter.'})}
    if(!password) {errorArray.push({name: 'password', text: 'Missing password parameter.'})}
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

    // Check if user can login
    userIdentityModel.login(email, password, function(response) {
        if(response.error) {
            res.status(400).send({
                status: 'error',
                message: response.text ? response.text : 'There was an error login the user. Please contact support if the issue persists.'
            })
        } else {
            // Get business details
            const getBusinessDetails = new Promise((resolve, reject) => {
                if(response.businessId) {
                    businessAccountsModel.getBusinessById(response.businessId, function(businessResponse) {
                        resolve(businessResponse[0] ? businessResponse[0] : null)
                    })
                } else {
                    resolve(null)
                }
            })

            // Get organization details
            const getOrganizationDetails = new Promise((resolve, reject) => {
                if(response.organizationId) {
                    organizationDetailsModel.getOrganizationById(response.organizationId, function(organizationDetailsResponse) {
                        resolve(organizationDetailsResponse[0] ? organizationDetailsResponse[0] : null)
                    })
                } else {
                    resolve(null)
                }
            })

            // Get user permissions
            const getUserPermissions = new Promise((resolve, reject) => {
                if(response.userPermissionsId) {
                    userIdentityModel.getUserPermissions(response.userPermissionsId, (userPermissionsResponse) => {
                        resolve(userPermissionsResponse[0] ? userPermissionsResponse[0] : null)
                    })
                } else {
                    resolve(null)
                }
            })

            // Get user organization permissions
            const getUserOrganizationPermissions = new Promise((resolve, reject) => {
                if(response.userOrganizationPermissionsId) {
                    userIdentityModel.getUserOrganizationPermissions(response.userOrganizationPermissionsId, (userOrganizationPermissionsResponse) => {
                        resolve(userOrganizationPermissionsResponse[0] ? userOrganizationPermissionsResponse[0] : null)
                    })
                } else {
                    resolve(null)
                }
            })

            // Get user/organization payment plan
            const getPaymentPlan = new Promise((resolve, reject) => {
                // Check for payment plan
                if(response.organizationId) {
                    paymentPlansModel.getOrganizationPaymentPlan(response.organizationId, (paymentPlanResponse) => {
                        if(!paymentPlanResponse.error && paymentPlanResponse[0]) {
                            resolve(paymentPlanResponse[0] ? paymentPlanResponse[0] : null)
                        } else {
                            resolve(null)
                        }
                    })
                } else {
                    resolve(null)
                }
            })

            Promise.all([
                getBusinessDetails,
                getOrganizationDetails,
                getUserPermissions,
                getUserOrganizationPermissions,
                getPaymentPlan
            ]).then((responseData) => {
                // Return data
                let payload = {
                    email: response.email,
                    userId: response.id,
                    firstName: response.firstName,
                    lastName: response.lastName,
                    profilePicture: response.profilePicture,
                    roleId: response.roleId,
                    roleType: response.roleType,
                    businessId: response.businessId,
                    organizationId: response.organizationId
                }
    
                let options = {
                    issuer: req.hostname,
                    subject: response.email,
                    audience: req.hostname
                }
    
                res.send({
                    status: 'success',
                    data: {
                        token: jwt.sign(payload, key, options),
                        user: response,
                        businessDetails: responseData[0] ? responseData[0] : null,
                        organizationDetails: responseData[1] ? responseData[1] : null,
                        userPermissions: responseData[2] ? responseData[2] : null,
                        userOrganizationPermissions: responseData[3] ? responseData[3] : null,
                        paymentPlan: responseData[4] ? responseData[4] : null
                    }
                })
            })
        }
    })
}

exports.signup = function(req, res) {
    // Check if all required variables have been passed
    let firstName = req.body['firstName']
    let lastName = req.body['lastName']
    let email = req.body['email']
    let phoneCountryCode = req.body['countryCode']
    let phoneNumber = req.body['phoneNumber']
    let password = req.body['password']
    let confirmPassword = req.body['confirmPassword']

    // Organization parameters
    let organizationName = req.body['organizationName']

    // Check if required parameters have been passed
    let errorArray = []
    if(!firstName) {errorArray.push({name: 'firstName', text: 'Missing first name parameter.'})}
    if(!phoneCountryCode) {errorArray.push({name: 'phoneCountryCode', text: 'Missing phone country code parameter.'})}
    if(!phoneNumber) {errorArray.push({name: 'phoneNumber', text: 'Missing phone number parameter.'})}
    if(!email) {errorArray.push({name: 'email', text: 'Missing email parameter.'})}
    if(!password) {errorArray.push({name: 'password', text: 'Missing password parameter.'})}
    if(!confirmPassword) {errorArray.push({name: 'confirmPassword', text: 'Missing confirm password parameter.'})}
    // if(!userRoleId) {errorArray.push({name: 'userRoleId', text: 'Missing role Id parameter.'})}
    if(!organizationName) {errorArray.push({name: 'organizationName', text: 'Missing organization name parameter.'})}
    // if(!businessTypeId) {errorArray.push({name: 'businessTypeId', text: 'Missing business type Id parameter.'})}
    if(password !== confirmPassword) {errorArray.push({name: 'confirmPassword', text: 'Passwords do not match. Please check.'})}

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

    // Insert organization details
    let insertOrganizationData = {
        organizationName: organizationName,
        organizationCreatedAt: moment().format('YYYY-MM-DD HH:mm:ss'),
        organizationUpdatedAt: moment().format('YYYY-MM-DD HH:mm:ss')
    }

    organizationDetailsModel.create(insertOrganizationData, function(response) {
        // Check if organization details were inserted
        if(response.insertId) {
            // Insert user details
            let insertUserData = {
                firstName: firstName ? firstName : null,
                lastName: lastName ? lastName : null,
                email: email ? email : null,
                phoneCountryCode: phoneCountryCode ? phoneCountryCode : null,
                userPhoneNumber: phoneNumber ? phoneNumber : null,
                password: bcrypt.hashSync(password, 10),
                roleId: 1, // 1 - organization owner id
                organizationId: response.insertId,
                activationCode: Math.floor(100000 + Math.random() * 900000),
                createdAt: moment().format('YYYY-MM-DD HH:mm:ss'),
                updatedAt: moment().format('YYYY-MM-DD HH:mm:ss')
            }

            userIdentityModel.signup(insertUserData, function(userResponse) {
                // Check if user details were inserted
                if(userResponse.insertId) {
                    exports.sendActivationEmail(insertUserData, function(activationEmailResponse) {
                        // Parse activation email response
                        if(activationEmailResponse.error) {
                            // Return error message
                            res.status(400).send({
                                status: 'error',
                                message: 'User successfully registered although the activation email was not send.'
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
            // Error inserting organization details
            res.status(400).send({
                status: 'error',
                message: 'There was an error inserting organization details. Please try again. If the issue persists, contact an administrator.'
            })
        }
    })
}

exports.activate = function(req, res) {
    // Get parameters
    let email = req.body['email']
    let activationCode = req.body['activationCode']

    // Check if required variables have been passed
    let errorArray = []
    if(!email) {errorArray.push({name: 'email', text: 'Missing email parameter.'})}
    if(!activationCode) {errorArray.push({name: 'activationCode', text: 'Missing activation code parameter.'})}
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

    let activationData = {
        activationCode: activationCode,
        activated: 1,
        updatedAt: moment().format('YYYY-MM-DD HH:mm:ss')
    }

    // Activate user
    userIdentityModel.activate(email, activationData, function(response) {
        if(response.error) {
            res.status(400).send({
                status: 'error',
                message: response.text
            })
        } else {
            if(response.affectedRows > 0) {
                // Send successful activation link
                let mailOptions = {
                    from: process.env.BUSINESS_NAME + ' <no-reply@upesisoft.com>',
                    to: email,
                    subject: process.env.BUSINESS_NAME + 'Successful Activation',
                    html: "<p>Your account has been successfully activated! Login <a href='https://www.focus.upesisoft.com/auth/login'>here</a> to access the platform.</p><p>Regards,</p><p>The Focus ERP Team</p>"
                }

                sendMail.send(mailOptions, function(response) {
                    // Return email send response
                    res.send({
                        status: 'success',
                        data: null
                    })
                })
            } else {
                res.status(400).send({
                    status: 'error',
                    message: 'There was an error activating the user. Please ensure the token has not been tampered with.'
                })
            }
        }
    })
}

exports.resetInitiate = function(req, res) {
    // Get parameters
    let email = req.body['email']
    
    // Check if required variables have been passed
    let errorArray = []
    if(!email) {errorArray.push({name: 'email', text: 'Missing email parameter.'})}

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
    
    // Check if valid user & activated
    userIdentityModel.getUser(null, email, function(response) { 
        if(response) {
            // Send out renewal email
            let resetData = {
                resetPasswordCode: Math.floor(100000 + Math.random() * 900000),
                updatedAt: moment().format('YYYY-MM-DD HH:mm:ss')
            }

            let updateVariable = {
                name: 'email',
                value: email
            }

            // Update user record
            userIdentityModel.updateUserDetails(updateVariable, resetData, function(response) {
                if(response.affectedRows > 0) {
                    // Generate token
                    let token = encodeURIComponent(Buffer.from(email + "+" + resetData.resetPasswordCode).toString('base64'))
                    let resetPasswordUrl = 'https://focus.upesisoft.com/auth/password/' + token
        
                    let mailOptions = {
                        from: process.env.BUSINESS_NAME + ' <no-reply@upesisoft.com>',
                        to: email,
                        subject: process.env.BUSINESS_NAME + 'Reset Password',
                        html: "<p>To reset your password, click <a href=" + resetPasswordUrl + ">here</a> and follow the instructions.</p><p>If you did not make this request, ignore this email.</p><p>Regards,</p><p>The Focus ERP Team</p>"
                    }
        
                    sendMail.send(mailOptions, function(response) {
                        // Return email send response
                        res.send({
                            status: 'success',
                            data: null
                        })
                    })

                } else {
                    res.status(400).send({
                        status: 'error',
                        message: 'Reset password instructions successfully sent. Please check your email.',
                        sqlMessage: response.sqlMessage ? response.sqlMessage : null
                    })
                }
            })

        } else {
            res.status(400).send({
                status: 'error',
                message: 'Reset password instructions successfully sent. Please check your email.'
            })
        }
    })

}

exports.resetComplete = function(req, res) {
    // Get parameters
    let email = req.body['email']
    let resetPasswordCode = req.body['resetPasswordCode']
    let password = req.body['password']
    let confirmPassword = req.body['confirmPassword']
    
    // Check if required variables have been passed
    let errorArray = []
    if(!email) {errorArray.push({name: 'email', text: 'Missing email parameter.'})}
    if(!resetPasswordCode) {errorArray.push({name: 'resetPasswordCode', text: 'Missing reset code parameter.'})}
    if(!password) {errorArray.push({name: 'password', text: 'Missing password parameter.'})}
    if(!confirmPassword) {errorArray.push({name: 'confirmPassword', text: 'Missing confirm password parameter.'})}
    if(password !== confirmPassword) {errorArray.push({name: 'confirmPassword', text: 'Passwords do not match. Please check.'})}

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

    let resetDetails = {
        email: email,
        resetPasswordCode: resetPasswordCode,
        password: password
    }

    // Update Password
    userIdentityModel.resetPassword(resetDetails, function(resetResponse) {
        if(resetResponse.error) {
            res.status(400).send({
                status: 'error',
                message: resetResponse.text
            })
        } else {
            // If no errors
            if(resetResponse.affectedRows > 0) {
                // Successfully updated
                res.send({
                    status: 'success',
                    data: null
                })

            } else {
                // Error
                res.status(400).send({
                    status: 'error',
                    message: 'There was an error updating user password. Please try again. If issue persists, please contact an administrator.'
                })
            }
        }
    })
}

// Send user activation email. Function on it's own for reusability.
exports.sendActivationEmail = function (insertUserData = null, callback) {
    // Get secure token
    let token = encodeURIComponent(Buffer.from(insertUserData.email + ":" + insertUserData.activationCode).toString('base64'))
    let activationUrl = 'https://www.focus.upesisoft.com/auth/activation/' + token

    let mailOptions = {
        from: 'Focus ERP <no-reply@upesisoft.com>',
        to: insertUserData.email,
        subject: 'Activation Email - Focus ERP',
        html: "<p>Dear " + insertUserData.firstName + ",</p><p>Thank you for signing up. To complete the process, click <a href=" + activationUrl + ">here</a> or enter the code below in the activation screen.</p><p><strong>" + insertUserData.activationCode + "</strong></p><p>Regards,</p><p>The Focus ERP Team</p>"
    }

    sendMail.send(mailOptions, function(response) {
        // Return email send response
        callback(response)
    })

}
