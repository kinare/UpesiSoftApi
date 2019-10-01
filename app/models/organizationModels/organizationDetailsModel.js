let mysql = require('mysql');
let pool  = mysql.createPool({
    connectionLimit : 10,
    host            : process.env.DB_HOST,
    user            : process.env.DB_USERNAME,
    password        : process.env.DB_PASSWORD,
    database        : process.env.DB_DATABASE
})

exports.create = function(organizationDetails = null, callback) {
    let sql = "INSERT INTO ?? SET ?";

    let inserts = ['organizations', organizationDetails];
    sql = mysql.format(sql, inserts);

    pool.query(sql, function (error, results, fields) {
        if (error) {
            callback({
                error: true,
                text: error.sqlMessage ? error.sqlMessage : 'There was a database error.'
            })
        } else {
            callback(results)
        }
    });
}

exports.update = function(updatedOrganizationDetails = null, organizationId = null, callback) {
    return true
}

exports.delete = function(organizationId = null, callback) {
    return true
}

exports.getOrganizationById = function(organizationId = null, callback) {
    let sql = "SELECT * FROM ?? WHERE ?? = ?";
    
    let inserts = ['organizations', 'id', organizationId];
    sql = mysql.format(sql, inserts);

    pool.query(sql, function (error, results, fields) {
        if (error) {
            callback({
                error: true,
                text: error.sqlMessage ? error.sqlMessage : 'There was a database error.'
            })
        } else {
            if(results && results.length > 0) {
                callback(results)
            } else {
                // No organization with that ID exists
                callback({
                    error: true,
                    text: error.sqlMessage ? error.sqlMessage : 'There was an error fetching organization details.'
                })
            }
        }
    });
}

exports.getAll = function(callback) {
    return true
}
