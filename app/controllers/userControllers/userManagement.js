const userManagementController = require('../../models/userModels/userManagementModel')

// Create new user(under a business) - Tie them down to a user group(can be custom to that business)
exports.createUser = function(req, res) {
    // Get params
    let firstName = req.body['firstName']
    let lastName = req.body['lastName']

}

// Create new user category - set up permissions and user group details
exports.createCategory = function(req, res) {

}
