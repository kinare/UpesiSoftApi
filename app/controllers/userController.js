let userModel = require('../models/userModel')

exports.login = function(req, res) {
    // Get request parameters
    let email = req.body['email']
    let password = req.body['password']
    
    // Check if user can login
    userModel.login(email, password, function(response) {
        if(response) {
            res.send({
                status: 'success',
                data: {
                    user: response,
                    token: ''
                }
            })
        } else {
            res.send({
                status: 'error',
                message: 'Please check your credentials.'
            })
        }
    })
}
