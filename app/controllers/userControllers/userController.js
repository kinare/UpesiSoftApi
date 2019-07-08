let userIdentityModel = require('../../models/userModels/userIdentityModel')
let businessAccountsModel = require('../../models/businessModels/businessAccountModel')
let sendMail = require('../../libraries/sendMail')
var moment = require('moment')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken');
const key = 'SFS234JKSP94RKS024NA052HOPQWR24'

exports.verifyUserToken = function(req, res, next) {
    try{
        const token = req.headers.authorization.split(" ")[1]
        jwt.verify(token, key, function (err, payload) {
            console.log(payload)
            if(payload && payload.email) {
                // Get user based on the payload
                userIdentityModel.getByEmail(payload.email, function(response) {
                    // Check if the user exists
                    if(response && response.length > 0) {
                        req.userDetails = response[0]
                        next()
                    } else {
                        res.send({
                            status: 'error',
                            message: 'There was an error verifying the user. Please ensure that the token has not been tampered with.'
                        })
                    }
                })
            } else {
                res.send({
                    status: 'error',
                    message: 'There was an error verifying the user. Please ensure that the token has not been tampered with.'
                })
            }
        })
    }catch(e){
        res.send({
            status: 'error',
            message: 'There was an error verifying the user.'
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
            message: 'Missing parameters.',
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
                message: response.text
            })
        } else {
            // Get user token
            let payload = {
                email: response.email,
                userId: response.id,
                firstName: response.firstName,
                lastName: response.lastName,
                profilePicture: response.profilePicture,
                roleId: response.roleId,
                userType: response.userType,
                businessId: response.businessId
            }

            let options = {
                issuer: req.hostname,
                subject: response.email,
                audience: req.hostname
            }

            res.send({
                status: 'success',
                data: {
                    user: response,
                    token: jwt.sign(payload, key, options)
                }
            })
        }
    })
}

exports.signup = function(req, res) {
    // Check if all required variables have been passed
    let firstName = req.body['firstName']
    let lastName = req.body['lastName']
    let email = req.body['email']
    let password = req.body['password']
    let confirmPassword = req.body['confirmPassword']
    let userRoleId = req.body['userRoleId']

    // Business parameters
    let businessName = req.body['businessName']
    let businessTypeId = req.body['businessTypeId']

    // Check if required parameters have been passed
    let errorArray = []
    if(!firstName) {errorArray.push({name: 'firstName', text: 'Missing first name parameter.'})}
    if(!lastName) {errorArray.push({name: 'lastName', text: 'Missing last name parameter.'})}
    if(!email) {errorArray.push({name: 'email', text: 'Missing email parameter.'})}
    if(!password) {errorArray.push({name: 'password', text: 'Missing password parameter.'})}
    if(!confirmPassword) {errorArray.push({name: 'confirmPassword', text: 'Missing confirm password parameter.'})}
    if(!userRoleId) {errorArray.push({name: 'userRoleId', text: 'Missing role Id parameter.'})}
    if(!businessName) {errorArray.push({name: 'businessName', text: 'Missing business name parameter.'})}
    if(!businessTypeId) {errorArray.push({name: 'businessTypeId', text: 'Missing business type Id parameter.'})}
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

    // Insert business details
    let insertBusinessData = {
        businessName: businessName,
        businessTypeId: businessTypeId,
        createdAt: moment().format('YYYY-MM-DD HH:mm:ss'),
        updatedAt: moment().format('YYYY-MM-DD HH:mm:ss')
    }

    businessAccountsModel.register(insertBusinessData, function(response) {
        // Check if business details were inserted
        if(response.insertId) {
            // Insert user details
            let insertUserData = {
                firstName: firstName,
                lastName: lastName,
                email: email,
                password: bcrypt.hashSync(password, 10),
                roleId: userRoleId,
                businessId: response.insertId,
                activationCode: Math.floor(100000 + Math.random() * 900000),
                createdAt: moment().format('YYYY-MM-DD HH:mm:ss'),
                updatedAt: moment().format('YYYY-MM-DD HH:mm:ss')
            }

            userIdentityModel.signup(insertUserData, function(userResponse) {
                // Check if user details were inserted
                if(userResponse.insertId) {
                    sendActivationEmail(insertUserData, function(activationEmailResponse) {
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
            // Error inserting business data
            res.status(400).send({
                status: 'error',
                message: 'There was an error inserting business details. Please try again. If the issue persists, contact an administrator.'
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
            message: 'Missing parameters.',
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
                    from: 'orders@doorstep.co.ke',
                    to: email,
                    subject: 'Successful Activation - Focus ERP',
                    html: "<p>Your account has been successfully activated! Login <a href='http://localhost:3000/login'>here</a> to access the platform.</p><p>Regards,</p><p>The Focus ERP Team</p>"
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
            message: 'Missing parameters.',
            data: {
                list: errorArray
            }
        })
    }
    
    // Check if valid user & activated
    userIdentityModel.getByEmail(email, function(response) { 
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
                    let resetPasswordUrl = 'http://localhost/reset?ss=' + token
        
                    let mailOptions = {
                        from: 'orders@doorstep.co.ke',
                        to: email,
                        subject: 'Reset Password - Focus ERP',
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
                        message: 'Reset password instructions successfully sent. Please check your email.'
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
            message: 'Missing parameters.',
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
function sendActivationEmail(insertUserData = null, callback) {
    // Get secure token
    let token = encodeURIComponent(Buffer.from(insertUserData.email + "+" + insertUserData.activationCode).toString('base64'))
    let activationUrl = 'http://localhost/activate?ss=' + token

    let mailOptions = {
        from: 'orders@doorstep.co.ke',
        to: insertUserData.email,
        subject: 'Activation Email - Focus ERP',
        html: "<p>Dear " + insertUserData.firstName + ",</p><p>Thank you for signing up. To complete the process, click <a href=" + activationUrl + ">here</a> or enter the code below in the activation screen.</p><p><strong>" + insertUserData.activationCode + "</strong></p><p>Regards,</p><p>The Focus ERP Team</p>"
    }

    sendMail.send(mailOptions, function(response) {
        // Return email send response
        callback(response)
    })

}
