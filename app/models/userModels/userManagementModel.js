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
