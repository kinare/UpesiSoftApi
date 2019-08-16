let mysql = require('mysql')
let pool  = mysql.createPool({
    connectionLimit : 10,
    host            : process.env.DB_HOST,
    user            : process.env.DB_USERNAME,
    password        : process.env.DB_PASSWORD,
    database        : process.env.DB_DATABASE
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

// Update Permissions
exports.updatePermissions = function(permissionId = null, updateData = null, callback) {
    // If codes match, update entry
    let sql = "UPDATE ?? SET ? WHERE ?? = ?";

    let inserts = ['userPermissions', updateData, 'id', permissionId];
    sql = mysql.format(sql, inserts);

    pool.query(sql, function (error, results, fields) {
        if (error) {
            // throw error
            callback({error: 'true', text: error.sqlMessage ? error.sqlMessage : 'There was an error updating the permission details.', sqlMessage: error.sqlMessage ? error.sqlMessage : null})
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

// Update user role
exports.updateUserRole = function(userRoleId = null, businessId = null, updateData = null, callback) {
    let sql = "UPDATE ?? SET ? WHERE ?? = ? AND ?? = ?";

    let inserts = ['userRoles', updateData, 'id', userRoleId, 'businessId', businessId];
    sql = mysql.format(sql, inserts);

    pool.query(sql, function (error, results, fields) {
        if (error) {
            // throw error
            callback({error: 'true', text: error.sqlMessage ? error.sqlMessage : 'There was an error updating role details.', sqlMessage: error.sqlMessage ? error.sqlMessage : null})
        } else {
            callback(results)
        }
    });
}

// Get all users
exports.getAllUsers = function(businessId = null, callback) {
    let sql = "SELECT users.id, users.firstName, users.lastName, users.email, users.phoneCountryCode, users.userPhoneNumber, users.roleId, users.businessId, users.profilePicture, users.createdAt, users.updatedAt, userRoles.roleName, userRoles.roleType, userRoles.roleDescription FROM ?? LEFT JOIN ?? ON ?? = ?? WHERE ?? = ? AND ?? = ?";
    
    let inserts = ['users', 'userRoles', 'userRoles.id', 'users.roleId', 'users.businessId', businessId, 'users.state', 1];
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

// Get all user roles + global users
exports.getAllUserRoles = function(businessId = null, callback) {
    let sql = "SELECT userRoles.id, userRoles.roleName, userRoles.roleType, userRoles.roleDescription, userRoles.userPermissionsId, userRoles.createdAt, userRoles.updatedAt, userRoles.state, userPermissions.* FROM ?? LEFT JOIN ?? ON ?? = ?? WHERE ?? = ? OR ?? IS NULL";
    
    let inserts = ['userRoles', 'userPermissions', 'userPermissions.id', 'userRoles.userPermissionsId', 'userRoles.businessId', businessId, 'userRoles.businessId'];

    sql = mysql.format(sql, inserts);

    pool.query(sql, function (error, results, fields) {
        if (error) {
            callback({
                error: true,
                text: 'There was an error retrieving the user roles list.',
                sqlMessage: error.sqlMessage 
            })
        } else {
            if(results && results.length > 0) {
                callback(results)
            } else {
                // No users exists
                callback({
                    error: true,
                    text: 'There were no user roles found.'
                })
            }
        }
    });
}

// Get user role
exports.getUserRole = function(roleId = null, businessId = null, callback) {
    let sql = "SELECT * FROM ?? WHERE ?? = ? AND ?? = ? AND ?? = ?";
    
    let inserts = ['userRoles', 'businessId', businessId, 'id', roleId, 'state', 1];

    sql = mysql.format(sql, inserts);

    pool.query(sql, function (error, results, fields) {
        if (error) {
            callback({
                error: true,
                text: 'There was an error retrieving the user role.',
                sqlMessage: error.sqlMessage 
            })
        } else {
            if(results && results.length > 0) {
                callback(results)
            } else {
                // No users exists
                callback({
                    error: true,
                    text: 'No user role found.'
                })
            }
        }
    });
}

// Delete user
exports.deleteUser = function(updateVariables, updateData, callback) {
    // If codes match, update entry
    let sql = "UPDATE ?? SET ? WHERE ?? = ? AND ?? = ?";

    let inserts = ['users', updateData, 'id', updateVariables['id'], 'businessId', updateVariables['businessId']];
    sql = mysql.format(sql, inserts);

    pool.query(sql, function (error, results, fields) {
        if (error) {
            // throw error
            callback(false)
        } else {
            callback(results)
        }
    });
}

// Run delete user
exports.deleteUserRole = function(updateVariables = null, updateData = null, callback) {
    // If codes match, update entry
    let sql = "UPDATE ?? SET ? WHERE ?? = ? AND ?? = ?";

    let inserts = ['userRoles', updateData, 'id', updateVariables['id'], 'businessId', updateVariables['businessId']];
    sql = mysql.format(sql, inserts);

    pool.query(sql, function (error, results, fields) {
        if (error) {
            // throw error
            callback(false)
        } else {
            callback(results)
        }
    });
}

// Get business types
exports.getBusinessTypes = function(callback) {
    let sql = "SELECT * FROM ?? WHERE ?? = ?";
    
    let inserts = ['businessTypes', 'state', 1];
    sql = mysql.format(sql, inserts);

    pool.query(sql, function (error, results, fields) {
        if (error) {
            callback({
                error: true,
                text: 'There was an error retrieving business types.',
                sqlMessage: error.sqlMessage 
            })
        } else {
            if(results && results.length > 0) {
                callback(results)
            } else {
                // No business types exists
                callback({
                    error: true,
                    text: 'There were no business types found.'
                })
            }
        }
    });
}
