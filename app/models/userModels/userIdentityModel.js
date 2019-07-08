let mysql = require('mysql');
const bcrypt = require('bcryptjs');
let pool  = mysql.createPool({
    connectionLimit : 10,
    host            : 'localhost',
    user            : 'root',
    password        : 'Karibu098!@#',
    database        : 'focusErp'
});
var moment = require('moment')

// Get user by email
exports.getByEmail = function(email = null, callback) {
    let sql = "SELECT users.*, userRoles.userType FROM ?? LEFT JOIN ?? ON ?? = ?? WHERE ?? = ?";

    // let columns = ['users.*', 'userRoles.name as userType'];
    let inserts = ['users', 'userRoles', 'users.roleId', 'userRoles.id', 'email', email];
    sql = mysql.format(sql, inserts);

    pool.query(sql, function (error, results, fields) {
        if (error) {
            callback(false)
        } else {
            if(results && results.length > 0) {
                callback(results)
            } else {
                // No user exists
                callback(false)
            }
        }
    });
}

// Run user update
exports.updateUserDetails = function(updateVariable = null, updateData = null, callback) {
    // If codes match, update entry
    let sql = "UPDATE ?? SET ? WHERE ?? = ?";

    let inserts = ['users', updateData, updateVariable['name'], updateVariable['value']];
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

// Check if user can login
exports.login = function(email = null, password = null, callback) {
    let sql = "SELECT users.*, userRoles.userType FROM ?? LEFT JOIN ?? ON ?? = ?? WHERE ?? = ? AND ?? = ?";

    let inserts = ['users', 'userRoles', 'users.roleId', 'userRoles.id', 'email', email, 'users.state', 1];
    sql = mysql.format(sql, inserts);

    pool.query(sql, function (error, results, fields) {
        if (error) {
            // throw error;
            callback({error: 'true', text: error.sqlMessage})
        } else {
            if(results && results.length > 0) {
                // Check if activated
                if(results[0].activated) {
                    bcrypt.compare(password, results[0].password, function(err, res) {
                        if(res) {
                            // Passwords match
                            // Remove password field
                            delete results[0].password
                            callback(results[0])
                        } else {
                            // Passwords don't match
                            callback({error: 'true', text: 'Please enter the correct email and password.'})
                        } 
                    });
                } else {
                    callback({error: 'true', text: 'Please activate your account first.'})
                }

            } else {
                // No user exists
                callback({error: 'true', text: 'Please enter the correct email and password.'})
            }
        }
    });
}

// Sign up user
exports.signup = function(insertData = null, callback) {
    let sql = "INSERT INTO ?? SET ?";

    let inserts = ['users', insertData];
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

exports.activate = function(email = null, activateData = null, callback) {
    // Get user data first
    let getSql = "SELECT * FROM ?? WHERE ?? = ?";

    let getInserts = ['users', 'email', email];
    getSql = mysql.format(getSql, getInserts);

    pool.query(getSql, function (error, results, fields) {
        if (error) {
            callback({
                error: true,
                text: error.sqlMessage
            })
        } else {
            if(results && results.length > 0) {
                // Check if codes match
                if(activateData.activationCode === results[0].activationCode) {
                    // If codes match, update entry
                    let sql = "UPDATE ?? SET ? WHERE ?? = ?";
                    
                    activateData.activationCode = null

                    let inserts = ['users', activateData, 'email', email];
                    sql = mysql.format(sql, inserts);
                
                    pool.query(sql, function (error, results, fields) {
                        if (error) {
                            callback({
                                error: true,
                                text: error.sqlMessage
                            })
                        } else {
                            callback(results)
                        }
                    });
                } else {
                    // If codes don't match
                    callback({error: true, text: 'Please enter the correct activation code.'})
                }
            } else {
                // No user with that email found
                callback({error: true, text: 'User not found. Please ensure that the token was not tampered with.'})
            }
        }
    });
}

exports.resetPassword = function(resetDetails, callback) {
    // Get user based on email
    exports.getByEmail(resetDetails.email, function(userDetails) {
        if(userDetails[0]) {
            // Check if code matches
            if(userDetails[0].resetPasswordCode === resetDetails.resetPasswordCode) {
                // Check if passwords are the same
                bcrypt.compare(resetDetails.password, userDetails[0].password, function(err, res) {
                    if(res) {
                        // Passwords match
                        callback({
                            error: true,
                            text: 'Password cannot be the same as the old one. Please enter a new password.'
                        })
                    } else {
                        // Passwords don't match - Update password entry
                        let updateVariable = {
                            name: 'id',
                            value: userDetails[0].id
                        }

                        let updateData = {
                            password: bcrypt.hashSync(resetDetails.password, 10),
                            resetPasswordCode: null,
                            updatedAt: moment().format('YYYY-MM-DD HH:mm:ss')
                        }

                        exports.updateUserDetails(updateVariable, updateData, function(updateResponse) {
                            callback(updateResponse)
                        })
                    } 
                });

            } else {
                // Codes do not match
                callback({
                    error: true,
                    text: 'Codes do not match. Please ensure that your token was not tampered with.'
                })
            }
        } else {
            // No such user exists
            callback({
                error: true,
                text: 'No such user exists. Please ensure that your token was not tampered with.'
            })
        }
    })
}
