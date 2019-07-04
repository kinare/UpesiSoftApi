let mysql = require('mysql');
const bcrypt = require('bcryptjs');
let pool  = mysql.createPool({
    connectionLimit : 10,
    host            : 'localhost',
    user            : 'root',
    password        : 'Karibu098!@#',
    database        : 'focusErp'
});

// Check if user can login
exports.login = function (email = null, password = null, callback) {
    let sql = "SELECT * FROM ?? WHERE ?? = ?";

    let inserts = ['users', 'email', email];
    sql = mysql.format(sql, inserts);

    pool.query(sql, function (error, results, fields) {
        if (error) {
            throw error;
        } else {
            if(results && results.length > 0) {
                bcrypt.compare(password, results[0].password, function(err, res) {
                    if(res) {
                        // Passwords match
                        // Remove password field
                        delete results[0].password
                        callback(results[0])
                    } else {
                        // Passwords don't match
                        callback(false)
                    } 
                });

            } else {
                // No user exists
                callback(false)
            }
        }
    });
}