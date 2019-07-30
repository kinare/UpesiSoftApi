let mysql = require('mysql')
let pool  = mysql.createPool({
    connectionLimit : 10,
    host            : 'localhost',
    user            : 'root',
    password        : 'Karibu098!@#',
    database        : 'focusErp'
})

// Storing permissions
exports.savePermissions = function (userPermissions = null, callback) {
    let sql = "INSERT INTO ?? SET ?";

    let inserts = ['userPermissions', userPermissions];
    sql = mysql.format(sql, inserts);

    pool.query(sql, function (error, results, fields) {
        if(error) {
            callback({
                error: true,
                text: error.sqlMessage
            })
        } else {
            callback(results)
        }
    });
}

// Create new user role
exports.createUserRole = function (userRoleDetails = null, callback) {
    let sql = "INSERT INTO ?? SET ?";

    let inserts = ['userRoles', userRoleDetails];
    sql = mysql.format(sql, inserts);

    pool.query(sql, function (error, results, fields) {
        if(error) {
            callback({
                error: true,
                text: error.sqlMessage
            })
        } else {
            callback(results)
        }
    });
}

// Get all users
exports.getAllUsers = function(businessId = null, callback) {
    let sql = "SELECT * FROM ?? WHERE ?? = ? AND ?? = ?";
    
    let inserts = ['users', 'businessId', businessId, 'state', 1];
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
