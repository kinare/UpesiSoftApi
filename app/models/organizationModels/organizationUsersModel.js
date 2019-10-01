let mysql = require('mysql');
const bcrypt = require('bcryptjs');
let pool  = mysql.createPool({
    connectionLimit : 10,
    host            : process.env.DB_HOST,
    user            : process.env.DB_USERNAME,
    password        : process.env.DB_PASSWORD,
    database        : process.env.DB_DATABASE
})
var moment = require('moment')

// Get all users
exports.getAllUsers = function(organizationId = null, callback) {
    let sql = "SELECT users.id, users.firstName, users.lastName, users.email, users.phoneCountryCode, users.userPhoneNumber, users.roleId, users.businessId, users.organizationId, users.profilePicture, users.createdAt, users.updatedAt, userRoles.roleName, userRoles.roleType, userRoles.roleDescription FROM ?? LEFT JOIN ?? ON ?? = ?? WHERE ?? = ? AND ?? = ?";
    
    let inserts = ['users', 'userRoles', 'userRoles.id', 'users.roleId', 'users.organizationId', organizationId, 'users.state', 1];
    sql = mysql.format(sql, inserts);

    pool.query(sql, function (error, results, fields) {
        if (error) {
            callback({
                error: true,
                text: 'There was an error retrieving the user list.',
                sqlMessage: error.sqlMessage 
            })
        } else {
            if(results && results.length > 0) {
                callback(results)
            } else {
                // No users exists
                callback({
                    error: true,
                    text: 'There were no users found.'
                })
            }
        }
    });
}
